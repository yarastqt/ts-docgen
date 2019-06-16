import { Node, JSDoc, Project, TypeGuards, getCompilerOptionsFromTsConfig } from 'ts-morph'

const { isJSDocParameterTag, isClassDeclaration, isVariableStatement } = TypeGuards
type Maybe<T> = T | undefined

const getJsDocFromNode = (node: Node): Maybe<JSDoc> => {
  if (isClassDeclaration(node) || isVariableStatement(node)) {
    const jsDocs = node.getJsDocs()
    return jsDocs[jsDocs.length - 1]
  }
  return undefined
}

const getInterfaceNameFromNode = (node: Node): Maybe<string> => {
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

export const jsDocResolver = (node: Node) => {
  if (isClassDeclaration(node) || isVariableStatement(node)) {
    const componentInterfaceName = getInterfaceNameFromNode(node)
  }
}
