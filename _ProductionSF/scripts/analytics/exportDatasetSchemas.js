#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const API_VERSION = process.env.CRM_ANALYTICS_API_VERSION || "67.0";
const DEFAULT_OUTPUT = path.join(__dirname, "dataset-schema-index.json");

const args = parseArgs(process.argv.slice(2));

async function main() {
  const auth = getOrgAuth(args.targetOrg);
  const datasets = await fetchAllDatasets(auth);
  const rows = [];

  for (const dataset of datasets) {
    const version = dataset.currentVersion || dataset.current_version || {};
    let xmdMain =
      dataset.xmdMain ||
      dataset.xmdmain ||
      version.xmdMain ||
      version.xmdmain ||
      null;

    if (!xmdMain) {
      const versionUrl = resolveVersionUrl(dataset, version);
      if (versionUrl) {
        const versionDetails = await apiGet(auth, versionUrl);
        xmdMain =
          versionDetails.xmdMain ||
          versionDetails.xmdmain ||
          versionDetails.xmd ||
          null;
      }
    }

    const datasetRows = extractFieldRows(dataset, version, xmdMain);
    if (datasetRows.length > 0) {
      rows.push(...datasetRows);
    } else {
      rows.push({
        datasetId: dataset.id || "",
        datasetName: dataset.name || "",
        datasetLabel: dataset.label || "",
        versionId: version.id || version.versionId || "",
        fieldPath: "",
        fieldName: "",
        fieldLabel: "",
        dataType: "",
        sourceType: ""
      });
    }
  }

  const filteredRows = args.search ? filterRows(rows, args.search) : rows;
  const outputText =
    args.format === "csv"
      ? toCsv(filteredRows)
      : JSON.stringify(filteredRows, null, 2);
  const outputPath = path.resolve(args.out || DEFAULT_OUTPUT);

  fs.writeFileSync(outputPath, outputText, "utf8");
  console.log(
    `Exported ${filteredRows.length} field rows from ${datasets.length} datasets to ${outputPath}`
  );

  if (args.search) {
    printSearchHits(filteredRows, args.search);
  }
}

function parseArgs(argv) {
  const result = {
    out: null,
    format: "json",
    search: "",
    targetOrg:
      process.env.SF_TARGET_ORG || process.env.SFDX_DEFAULTUSERNAME || ""
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const nextToken = argv[index + 1];

    if (token === "--out" && nextToken) {
      result.out = nextToken;
      index += 1;
      continue;
    }

    if (token === "--format" && nextToken) {
      result.format = nextToken.toLowerCase() === "csv" ? "csv" : "json";
      index += 1;
      continue;
    }

    if (token === "--search" && nextToken) {
      result.search = nextToken;
      index += 1;
      continue;
    }

    if (token === "--target-org" && nextToken) {
      result.targetOrg = nextToken;
      index += 1;
      continue;
    }

    if (token === "--help" || token === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return result;
}

function printHelp() {
  console.log(`Usage: node scripts/analytics/exportDatasetSchemas.js [options]

Options:
  --target-org <alias>  Salesforce org alias or username. Defaults to the active org.
  --out <path>          Output file path. Defaults to scripts/analytics/dataset-schema-index.json.
  --format <json|csv>   Output format. Defaults to json.
  --search <term>       Filter rows by dataset or field name before writing output.
  -h, --help            Show this help.
`);
}

function getOrgAuth(targetOrg) {
  const sfCommand = process.platform === "win32" ? "sf.cmd" : "sf";
  const sfdxCommand = process.platform === "win32" ? "sfdx.cmd" : "sfdx";
  const cliCandidates = [
    [
      sfCommand,
      ["org", "display", "--json"].concat(
        targetOrg ? ["--target-org", targetOrg] : []
      )
    ],
    [
      sfdxCommand,
      ["force:org:display", "--json"].concat(targetOrg ? ["-u", targetOrg] : [])
    ]
  ];

  let lastError = null;
  for (const [command, commandArgs] of cliCandidates) {
    try {
      const raw = execFileSync(command, commandArgs, { encoding: "utf8" });
      const parsed = JSON.parse(raw);
      const result = parsed.result || parsed;
      if (result.instanceUrl && result.accessToken) {
        return {
          instanceUrl: result.instanceUrl.replace(/\/$/, ""),
          accessToken: result.accessToken,
          apiVersion: API_VERSION
        };
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    [
      "Unable to read Salesforce org auth.",
      "Authenticate with 'sf org login web' or 'sfdx auth:web:login', then rerun the command.",
      lastError ? `Last error: ${lastError.message}` : ""
    ]
      .filter(Boolean)
      .join(" ")
  );
}

async function fetchAllDatasets(auth) {
  const datasets = [];
  let nextUrl = `/services/data/v${auth.apiVersion}/wave/datasets?hasCurrentOnly=true&includeCurrentVersion=true&pageSize=200`;

  while (nextUrl) {
    const payload = await apiGet(auth, nextUrl);
    const pageDatasets =
      payload.datasets || payload.records || payload.items || [];
    datasets.push(...pageDatasets);

    if (payload.nextPageUrl) {
      nextUrl = payload.nextPageUrl;
    } else if (payload.nextPageToken) {
      nextUrl = `/services/data/v${
        auth.apiVersion
      }/wave/datasets?hasCurrentOnly=true&includeCurrentVersion=true&pageSize=200&page=${encodeURIComponent(
        payload.nextPageToken
      )}`;
    } else {
      nextUrl = "";
    }
  }

  return datasets;
}

async function apiGet(auth, resourcePath) {
  const url = resourcePath.startsWith("http")
    ? resourcePath
    : `${auth.instanceUrl}${resourcePath}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(
      `CRM Analytics request failed (${response.status} ${response.statusText}) for ${url}`
    );
  }

  return response.json();
}

function resolveVersionUrl(dataset, version) {
  const candidates = [
    version && version.url,
    version && version.versionUrl,
    dataset && dataset.currentVersionUrl,
    dataset && dataset.currentVersion && dataset.currentVersion.url,
    dataset &&
      dataset.url &&
      `${dataset.url.replace(/\/$/, "")}/versions/current`
  ];

  return candidates.find(Boolean) || "";
}

function extractFieldRows(dataset, version, xmdMain) {
  if (!xmdMain || typeof xmdMain !== "object") {
    return [];
  }

  const rows = [];
  const seen = new Set();

  walk(xmdMain, [], (node, pathSegments) => {
    const fieldName = firstString(node, [
      "field",
      "name",
      "apiName",
      "column",
      "sourceField",
      "sourceName"
    ]);
    if (!fieldName) {
      return;
    }

    const fieldLabel = firstString(node, [
      "label",
      "displayName",
      "title",
      "caption"
    ]);
    const dataType =
      firstString(node, ["dataType", "type", "valueType"]) ||
      nestedDataType(node);
    const sourceType =
      pathSegments.find((segment) =>
        [
          "measures",
          "dimensions",
          "dates",
          "derivedColumns",
          "fields",
          "columns"
        ].includes(segment)
      ) || "";
    const fieldPath = pathSegments.join(".");
    const key = [
      dataset.id || dataset.name || "",
      fieldName,
      fieldLabel || "",
      dataType || "",
      fieldPath
    ].join("|");

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    rows.push({
      datasetId: dataset.id || "",
      datasetName: dataset.name || "",
      datasetLabel: dataset.label || "",
      versionId: version.id || version.versionId || "",
      fieldPath,
      fieldName,
      fieldLabel,
      dataType,
      sourceType
    });
  });

  return rows;
}

function nestedDataType(node) {
  if (!node || typeof node !== "object") {
    return "";
  }

  if (node.format && typeof node.format === "object") {
    return firstString(node.format, ["type", "dataType"]) || "";
  }

  return "";
}

function walk(node, pathSegments, visit) {
  if (Array.isArray(node)) {
    node.forEach((entry, index) =>
      walk(entry, pathSegments.concat(String(index)), visit)
    );
    return;
  }

  if (!node || typeof node !== "object") {
    return;
  }

  visit(node, pathSegments);

  for (const [key, value] of Object.entries(node)) {
    if (value && typeof value === "object") {
      walk(value, pathSegments.concat(key), visit);
    }
  }
}

function firstString(node, keys) {
  for (const key of keys) {
    const value = node && node[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "";
}

function filterRows(rows, searchTerm) {
  const normalized = searchTerm.trim().toLowerCase();
  if (!normalized) {
    return rows;
  }

  return rows.filter((row) => {
    return [
      row.datasetName,
      row.datasetLabel,
      row.fieldName,
      row.fieldLabel,
      row.dataType,
      row.fieldPath
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalized));
  });
}

function printSearchHits(rows, searchTerm) {
  if (rows.length === 0) {
    console.log(`No matches found for "${searchTerm}".`);
    return;
  }

  const preview = rows.slice(0, 50).map((row) => ({
    dataset: row.datasetName || row.datasetLabel,
    field: row.fieldName,
    label: row.fieldLabel,
    type: row.dataType,
    path: row.fieldPath
  }));

  console.table(preview);
  if (rows.length > preview.length) {
    console.log(`Showing first ${preview.length} matches of ${rows.length}.`);
  }
}

function toCsv(rows) {
  const headers = [
    "datasetId",
    "datasetName",
    "datasetLabel",
    "versionId",
    "fieldPath",
    "fieldName",
    "fieldLabel",
    "dataType",
    "sourceType"
  ];
  const lines = [headers.join(",")];

  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header] || "")).join(","));
  }

  return lines.join("\n");
}

function csvEscape(value) {
  const text = String(value);
  if (/[\",\n]/.test(text)) {
    return `"${text.replace(/\"/g, '""')}"`;
  }

  return text;
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
