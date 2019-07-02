import { Node, SourceFile } from 'ts-morph'

import { PropTypes } from '../utils'

export type ResolverData = {
  filePath: string
  description?: string
  componentName?: string
  props?: PropTypes
}

export type Resolver = (sourceFile: SourceFile, node: Node) => ResolverData
