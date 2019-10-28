// USAGE: npm start -- [file-to-parse]+

import ts from 'typescript'

const toTitleCase = (s: string) => s[0].toUpperCase() + s.slice(1)

const program = ts.createProgram(process.argv.slice(2), {
  target: ts.ScriptTarget.ES2015,
  module: ts.ModuleKind.CommonJS
})
const checker = program.getTypeChecker()

const visit = (node: ts.Node) => {
  if (!ts.isInterfaceDeclaration(node)) {
    return
  }
  const symbol = checker.getSymbolAtLocation(node.name)

  // Only parse interface declarations named State
  if (symbol === undefined || symbol.name !== 'State') {
    return
  }
  const members = symbol.members
  if (members === undefined) {
    return
  }

  // Generate a lens for each prop on State
  members.forEach(value => {
    const selectorName = `select${toTitleCase(value.name)}`
    const declaration = `const ${selectorName} = Lens.fromProp<${symbol.name}>()('${value.name}')`
    console.log(declaration)
  })
}

for (const sourceFile of program.getSourceFiles()) {
  if (!sourceFile.isDeclarationFile) {
    ts.forEachChild(sourceFile, visit)
  }
}
