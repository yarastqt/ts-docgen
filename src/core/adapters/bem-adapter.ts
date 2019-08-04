import { EnhancedResolverData } from '../resolvers/interface'

const getComponentEntityRegExp = () => {
  const block = '([a-zA-Z0-9]+)'
  const elem = '(?:-([a-zA-Z0-9]+))?'
  const platform = '(?:@([a-zA-Z0-9]+))?'
  const modName = '(?:_([a-zA-Z0-9]+))?'
  const modVal = '(?:_([a-zA-Z0-9]+))?'
  const mod = modName + modVal
  return new RegExp(`^${block}${mod}${platform}$|^${block}${elem}${mod}${platform}$`)
}

// TODO: Use @bem/sdk.naming.cell.match, for this needed add component relative path to meta.
const getComponentEntity = (path: string) => {
  const matchedComponentName = path.match(/\/([A-z0-9@]+)+\..+$/)

  if (matchedComponentName === null) {
    // TODO: Add information.
    throw new Error('ops...')
  }

  const componentEntityRegExp = getComponentEntityRegExp()
  const executed = matchedComponentName[1].match(componentEntityRegExp)

  if (executed === null) {
    // TODO: Add information.
    throw new Error('ops...')
  }

  const modifierName = executed[2] || executed[6]

  return {
    platform: executed[4] || 'common',
    block: executed[1],
    element: executed[5],
    modifier: modifierName && {
      name: modifierName,
      value: executed[3] || executed[7] || true,
    },
  }
}

export const bemAdapter = (meta: EnhancedResolverData[]) => {
  const result = {}

  for (const { filePath } of meta) {
    const { platform, block, element, modifier } = getComponentEntity(filePath)

    // block case
    if (element === undefined && modifier === undefined) {
      console.log(block)
    }

    // block modifier case
    if (element === undefined && modifier !== undefined) {
      console.log(modifier)
    }
  }

  return {}
}
