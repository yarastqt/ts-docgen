import { Project } from 'ts-morph'
import { JsxEmit } from 'typescript'

import { Resolver, ResolverData, EnhancedResolverData } from './resolvers/interface'
import { MaybeArray } from './utility-types'

const projectOptions = {
  compilerOptions: {
    jsx: JsxEmit.React,
  },
}

export const extractMetaFromComponents = (
  files: string[],
  resolvers: Resolver[],
): MaybeArray<EnhancedResolverData> => {
  const result: Record<string, EnhancedResolverData> = {}
  const project = new Project(projectOptions)
  const sourceFiles = project.addExistingSourceFiles(files)
  sourceFiles.forEach((sourceFile) => {
    const filePath = sourceFile.getFilePath()
    sourceFile.forEachChild((node) => {
      const data = resolvers.reduce<ResolverData>(
        (acc, resolver) => ({ ...acc, ...resolver(sourceFile, node) }),
        {},
      )
      if (result[filePath] === undefined) {
        result[filePath] = { ...data, filePath }
      } else {
        Object.assign(result[filePath], data)
      }
    })
  })
  return Object.entries(result).map(([, value]) => value)
}
