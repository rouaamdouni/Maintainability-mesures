import fs from "fs";
import path from "path";

function analyzeBackendDocAndLogs(dir: string) {
  let totalFunctions = 0;
  let functionsWithLogs = 0;
  let documentedFunctions = 0;
  let totalFiles = 0;
  let documentedFiles = 0;

  function scanDirectory(directory: string) {
    const files = fs.readdirSync(directory);

    files.forEach((file) => {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !file.includes("node_modules")) {
        scanDirectory(filePath);
      } else if (
        file.endsWith(".ts") ||
        file.endsWith(".tsx") ||
        file.endsWith(".js")
      ) {
        totalFiles++;
        const content = fs.readFileSync(filePath, "utf-8");

        // 🔹 Détecter les blocs JSDoc/TSDoc
        const jsDocBlocks = content.match(/\/\*\*[\s\S]*?\*\//g) || [];
        if (jsDocBlocks.length > 0) documentedFiles++;

        // 🔹 Compter toutes les fonctions
        const functionMatches =
          content.match(
            /function\s+\w+|const\s+\w+\s*=\s*\(|async\s+\w+\s*\(/g
          ) || [];
        totalFunctions += functionMatches.length;

        // 🔹 Compter les fonctions documentées
        const documentedFunctionMatches =
          content.match(
            /\/\*\*[\s\S]*?\*\/\s*(export\s+)?(async\s+)?(function\s+\w+|const\s+\w+\s*=\s*\()/g
          ) || [];
        documentedFunctions += documentedFunctionMatches.length;

        // 🔹 Compter les logs
        const logMatches =
          content.match(
            /console\.(log|error|warn|info)|logger\.(log|error|warn|info)/g
          ) || [];
        if (logMatches.length > 0) {
          functionsWithLogs += Math.min(functionMatches.length, logMatches.length);
        }
      }
    });
  }

  scanDirectory(dir);

  // 🔹 Calcul des métriques
  const logCoverage =
    totalFunctions > 0
      ? ((functionsWithLogs / totalFunctions) * 100).toFixed(2)
      : "0.00";
  const functionDocCoverage =
    totalFunctions > 0
      ? ((documentedFunctions / totalFunctions) * 100).toFixed(2)
      : "0.00";
  const fileDocCoverage =
    totalFiles > 0
      ? ((documentedFiles / totalFiles) * 100).toFixed(2)
      : "0.00";

  // 🔹 Création du dossier reports
  const reportDir = path.join(process.cwd(), "reports");
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  // 🔹 Rapport JSON
  const report = {
    logCoverage: `${logCoverage}%`,
    functionDocCoverage: `${functionDocCoverage}%`,
    fileDocCoverage: `${fileDocCoverage}%`,
    totalFunctions,
    functionsWithLogs,
    documentedFunctions,
    totalFiles,
    documentedFiles,
  };

  fs.writeFileSync(
    path.join(reportDir, "backend-doc-log-report.json"),
    JSON.stringify(report, null, 2)
  );

  // 🔹 Affichage console
  console.log("\n📘 Rapport de Documentation JSDoc/TSDoc et Logs (Backend/Frontend)");
  console.log("=".repeat(65));
  console.log(`✅ Couverture des Logs : ${logCoverage}%`);
  console.log(
    `📌 Fonctions avec logs : ${functionsWithLogs}/${totalFunctions}`
  );
  console.log(`📚 Couverture des fonctions documentées : ${functionDocCoverage}%`);
  console.log(
    `📌 Fonctions documentées : ${documentedFunctions}/${totalFunctions}`
  );
  console.log(`📄 Couverture fichiers documentés : ${fileDocCoverage}%`);
  console.log(`📌 Fichiers documentés : ${documentedFiles}/${totalFiles}`);
}

// 🔹 Exécution du script sur le dossier src (frontend/backend)
analyzeBackendDocAndLogs("./src");
