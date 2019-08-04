import { Node, TypeGuards } from 'ts-morph'

import { Maybe } from '../utility-types'
import {
  getJsDocFromNode,
  getDescriptionFromNode,
  getProps,
  getComponentName,
  getTypeNodeFromSource,
} from '../utils'
import { Resolver, ResolverData } from './interface'

const getTypeNameFromJsDoc = (node: Node): Maybe<string> => {
  const jsdoc = getJsDocFromNode(node)
  if (!jsdoc) {
    return undefined
  }
  for (const tag of jsdoc.getTags()) {
    if (!TypeGuards.isJSDocParameterTag(tag)) {
      // eslint-disable-next-line no-continue
      continue
    }
    const typeExpression = tag.getTypeExpression()
    if (!typeExpression) {
      // eslint-disable-next-line no-continue
      continue
    }
    const text = typeExpression.getTypeNode().getText()
    if (text.match(/.+Props/)) {
      return text
    }
  }
  return undefined
}

export const jsDocResolver: Resolver = (sourceFile, node) => {
  const result: ResolverData = {}
  if (TypeGuards.isClassDeclaration(node) || TypeGuards.isVariableStatement(node)) {
    const typeName = getTypeNameFromJsDoc(node)
    const componentName = getComponentName(sourceFile, node)
    const description = getDescriptionFromNode(node)
    if (componentName !== undefined) {
      Object.assign(result, { componentName })
    }
    if (description !== undefined) {
      Object.assign(result, { description })
    }
    if (typeName === undefined) {
      return result
    }
    const typeNode = getTypeNodeFromSource(sourceFile, typeName)
    if (typeNode === undefined) {
      return result
    }
    const props = getProps(typeNode)
    Object.assign(result, { props })
  }
  return result
}
