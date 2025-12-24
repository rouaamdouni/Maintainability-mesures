import { ESLint } from "eslint"
import fs from "fs"
import path from "path"

async function analyzeComplexity() {
  try {
    // Create ESLint instance
    const eslint = new ESLint({
      overrideConfig: {
        rules: {
          complexity: ["warn", 10], // override or ensure the rule
        },
      },
      // useEslintrc: true, // ❌ removed
    })

    const results = await eslint.lintFiles(["src/**/*.ts"])

    const complexityIssues = []
    let totalComplexity = 0
    let functionCount = 0

    results.forEach((result) => {
      result.messages.forEach((message) => {
        if (message.ruleId === "complexity") {
          complexityIssues.push({
            file: path.relative(process.cwd(), result.filePath),
            line: message.line,
            message: message.message,
          })

          const match = message.message.match(/complexity of (\d+)/i)
          if (match) {
            totalComplexity += parseInt(match[1], 10)
            functionCount++
          }
        }
      })
    })

    const avgComplexity =
      functionCount > 0 ? (totalComplexity / functionCount).toFixed(2) : 0

    // Ensure reports directory exists
    const reportDir = path.join(process.cwd(), "reports")
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir)
    }

    fs.writeFileSync(
      path.join(reportDir, "complexity-report.json"),
      JSON.stringify(
        {
          averageComplexity: avgComplexity,
          totalFunctions: functionCount,
          highComplexityFunctions: complexityIssues.length,
          issues: complexityIssues,
        },
        null,
        2,
      ),
    )

    console.log("📊 Complexité Cyclomatique Moyenne:", avgComplexity)
    console.log("📈 Fonctions analysées:", functionCount)
    console.log("⚠️  Fonctions complexes (>10):", complexityIssues.length)
  } catch (error) {
    console.error("❌ Erreur lors de l'analyse de complexité :", error)
  }
}

analyzeComplexity()
