import { Resolver, ResolverData } from './interface'

export const abstractResolver: Resolver = (sourceFile) => {
  const filePath = sourceFile.getFilePath()
  const result: ResolverData = { filePath }
  return result
}
