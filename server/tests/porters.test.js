import importScenario from "../components/importer"
import exportScenario from "../components/exporter"
import fs from "fs"
import YAML from "yaml"
import path from "path"
import { expect, test } from "vitest"
import { Scenario } from "../classes.js"

test('Importing and exporting a scenario should result in the same YAML', () => {

    const data = fs.readFileSync(path.resolve(__dirname, './scenario.yaml'), 'utf8')
    const parsedData = YAML.parse(data)
    const importedScenario = importScenario(parsedData)
    const exportedScenario = exportScenario(importedScenario)
    const exportedData = YAML.parse(exportedScenario)

    expect(exportedData).toEqual(parsedData)

})