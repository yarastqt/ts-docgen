import { Project } from 'ts-morph'
import { JsxEmit } from 'typescript'

import { jsDocResolver } from './resolvers/jsdoc-resolver'

const projectOptions = {
  compilerOptions: {
    jsx: JsxEmit.React,
  },
}

export const extractMetaFromComponents = (files: string[]) => {
  // const result = []
  const project = new Project(projectOptions)
  const sourceFiles = project.addExistingSourceFiles(files)

  sourceFiles.forEach((sourceFile) => {
    // const filePath = sourceFile.getFilePath();
    sourceFile.forEachChild((node) => {
      jsDocResolver(node)
    })
  })
}
