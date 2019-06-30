import { Node, SourceFile } from 'ts-morph'

import { PropTypes } from '../utils'

export type ResolverData = {
  filePath: string
  description?: string
  componentName?: string
  props?: PropTypes
}

export const abstractResolver = (sourceFile: SourceFile, node: Node): ResolverData => {
  const filePath = sourceFile.getFilePath()
  const result = { filePath }
  return result
}
