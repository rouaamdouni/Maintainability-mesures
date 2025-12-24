import fs from "fs"
import madge from "madge"
import path from "path"

async function analyzeCoupling() {
  try {
    // Run madge analysis
    const res = await madge("src/", {
      fileExtensions: ["ts", "tsx"],
      tsConfig: "./tsconfig.json",
    })

    const dependencies = res.obj()
    const circular = res.circular()

    let totalDependencies = 0
    let maxCoupling = 0
    let mostCoupledFile = ""

    Object.keys(dependencies).forEach((file) => {
      const depCount = dependencies[file].length
      totalDependencies += depCount

      if (depCount > maxCoupling) {
        maxCoupling = depCount
        mostCoupledFile = file
      }
    })

    const avgCoupling = (
      totalDependencies / Object.keys(dependencies).length
    ).toFixed(2)

    // Ensure reports folder exists
    const reportDir = path.join(process.cwd(), "reports")
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    const report = {
      averageCoupling: avgCoupling,
      maxCoupling,
      mostCoupledFile,
      totalModules: Object.keys(dependencies).length,
      circularDependencies: circular.length,
      circularDetails: circular,
    }

    fs.writeFileSync(
      path.join(reportDir, "coupling-report.json"),
      JSON.stringify(report, null, 2),
    )

    console.log("\n🔗 Rapport de Couplage:")
    console.log("=".repeat(50))
    console.log(`📊 Couplage moyen: ${avgCoupling} dépendances/module`)
    console.log(`📈 Couplage maximum: ${maxCoupling} (${mostCoupledFile})`)
    console.log(`🔄 Dépendances circulaires: ${circular.length}`)

    if (circular.length > 0) {
      console.log("\n⚠️  Dépendances circulaires détectées:")
      circular.forEach((cycle, index) => {
        console.log(`   ${index + 1}. ${cycle.join(" -> ")}`)
      })
    }

    // Generate dependency graph image
    await res.image(path.join(reportDir, "dependency-graph.png"))
    console.log("\n📊 Graphique généré: reports/dependency-graph.png")
  } catch (error) {
    console.error("❌ Erreur lors de l'analyse de couplage :", error)
  }
}

// Run the analysis
analyzeCoupling()
