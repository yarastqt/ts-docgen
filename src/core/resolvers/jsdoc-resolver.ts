import { TypeAliasDeclaration, InterfaceDeclaration, Node, TypeGuards, SourceFile } from 'ts-morph'

import { Maybe } from '../utility-types'
import { getJsDocFromNode, getDescriptionFromNode, getPropTypes } from '../utils'

const { isJSDocParameterTag, isClassDeclaration, isVariableStatement } = TypeGuards

const getTypeNameFromNode = (node: Node): Maybe<string> => {
  const jsdoc = getJsDocFromNode(node)
  if (!jsdoc) {
    return undefined
  }
  for (const tag of jsdoc.getTags()) {
    if (!isJSDocParameterTag(tag)) {
      continue
    }
    const typeExpression = tag.getTypeExpression()
    if (!typeExpression) {
      continue
    }
    const text = typeExpression.getTypeNode().getText()
    if (text.match(/.+Props/)) {
      return text
    }
  }
  return undefined
}

const getTypeNodeFromSource = (
  sourceFile: SourceFile,
  interfaceOrTypeName: string,
): Maybe<InterfaceDeclaration | TypeAliasDeclaration> => {
  const interfaceNode = sourceFile.getInterface(interfaceOrTypeName)
  const typeNode = sourceFile.getTypeAlias(interfaceOrTypeName)
  return interfaceNode || typeNode
}

export const jsDocResolver = (sourceFile: SourceFile, node: Node) => {
  const filePath = sourceFile.getFilePath()
  const result = { filePath }
  if (isClassDeclaration(node) || isVariableStatement(node)) {
    const typeName = getTypeNameFromNode(node)
    const description = getDescriptionFromNode(node)
    if (!typeName) {
      Object.assign(result, { description })
      return result
    }
    const typeNode = getTypeNodeFromSource(sourceFile, typeName)
    if (!typeNode) {
      // TODO: print warning.
      return result
    }
    const props = getPropTypes(typeNode)
    console.log(props)
  }
  return result
}
