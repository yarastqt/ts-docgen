import { Project } from 'ts-morph'
import { JsxEmit } from 'typescript'

import { Resolver, ResolverData } from './resolvers/interface'
import { abstractResolver } from './resolvers/abstract-resolver'
import { MaybeArray } from './utility-types'

const projectOptions = {
  compilerOptions: {
    jsx: JsxEmit.React,
  },
}

export const extractMetaFromComponents = (
  files: string[],
  resolvers: Resolver[],
): MaybeArray<ResolverData> => {
  const result: Record<string, ResolverData> = {}
  const project = new Project(projectOptions)
  const sourceFiles = project.addExistingSourceFiles(files)
  sourceFiles.forEach((sourceFile) => {
    sourceFile.forEachChild((node) => {
      const data = [...resolvers, abstractResolver].reduce(
        (acc, resolver) => ({ ...acc, ...resolver(sourceFile, node) }),
        {} as ResolverData,
      )
      if (result[data.filePath] === undefined) {
        result[data.filePath] = data
      } else {
        Object.assign(result[data.filePath], data)
      }
    })
  })
  return Object.entries(result).map(([, value]) => value)
}
