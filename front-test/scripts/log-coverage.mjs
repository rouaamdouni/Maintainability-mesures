import fs from "fs"
import path from "path"

function analyzeJsDocCoverage(dir: string) {
  let totalFunctions = 0
  let documentedFunctions = 0
  let totalFiles = 0
  let documentedFiles = 0

  function scanDirectory(directory: string) {
    const files = fs.readdirSync(directory)

    files.forEach((file) => {
      const filePath = path.join(directory, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory() && !file.includes("node_modules")) {
        scanDirectory(filePath)
      } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
        totalFiles++
        const content = fs.readFileSync(filePath, "utf-8")

        // 🔹 Détecter les blocs JSDoc / TSDoc
        const jsDocBlocks =
          content.match(/\/\*\*[\s\S]*?\*\//g) || []

        if (jsDocBlocks.length > 0) {
          documentedFiles++
        }

        // 🔹 Détecter les fonctions
        const functionMatches =
          content.match(
            /function\s+\w+|const\s+\w+\s*=\s*\(|async\s+\w+\s*\(/g
          ) || []

        totalFunctions += functionMatches.length

        // 🔹 Associer JSDoc à une fonction
        const documentedFunctionMatches =
          content.match(
            /\/\*\*[\s\S]*?\*\/\s*(export\s+)?(async\s+)?(function\s+\w+|const\s+\w+\s*=\s*\()/g
          ) || []

        documentedFunctions += documentedFunctionMatches.length
      }
    })
  }

  scanDirectory(dir)

  const functionDocCoverage =
    totalFunctions > 0
      ? ((documentedFunctions / totalFunctions) * 100).toFixed(2)
      : "0.00"

  const fileDocCoverage =
    totalFiles > 0
      ? ((documentedFiles / totalFiles) * 100).toFixed(2)
      : "0.00"

  // Create reports folder
  const reportDir = path.join(process.cwd(), "reports")
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true })
  }

  const report = {
    jsDocFunctionCoverage: `${functionDocCoverage}%`,
    jsDocFileCoverage: `${fileDocCoverage}%`,
    totalFunctions,
    documentedFunctions,
    totalFiles,
    documentedFiles,
  }

  fs.writeFileSync(
    path.join(reportDir, "jsdoc-coverage-report.json"),
    JSON.stringify(report, null, 2)
  )

  console.log("\n📘 Rapport de Documentation JSDoc / TSDoc")
  console.log("=".repeat(55))
  console.log(`📌 Couverture fonctions documentées : ${functionDocCoverage}%`)
  console.log(
    `📌 Fonctions documentées : ${documentedFunctions}/${totalFunctions}`
  )
  console.log(`📄 Couverture fichiers documentés : ${fileDocCoverage}%`)
  console.log(
    `📄 Fichiers documentés : ${documentedFiles}/${totalFiles}`
  )
}

// Run analysis
analyzeJsDocCoverage("./src")
