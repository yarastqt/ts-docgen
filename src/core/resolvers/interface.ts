import { Node, SourceFile } from 'ts-morph'

import { PropTypes } from '../utils'

export type ResolverData = {
  description?: string
  componentName?: string
  props?: PropTypes
}

export type EnhancedResolverData = {
  filePath: string
} & ResolverData

export type Resolver = (sourceFile: SourceFile, node: Node) => ResolverData
