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
    modifier: modifierName
      ? {
          name: modifierName,
          value: executed[3] || executed[7] || true,
        }
      : undefined,
  }
}

// TODO: Add return type.
export const bemAdapter = (meta: EnhancedResolverData[]) => {
  const temporaryMap = new Map<string, any /* EnhancedResolverData */>()

  for (const { filePath, props, description, componentName } of meta) {
    const { platform, block, element, modifier } = getComponentEntity(filePath)

    // block case
    if (element === undefined && modifier === undefined) {
      if (temporaryMap.has(block)) {
        // Add other props for same block at other platform.
        const prevBlock = temporaryMap.get(block)
        prevBlock.files = prevBlock.files.concat(filePath)
        prevBlock.props[platform] = props

        temporaryMap.set(block, prevBlock)
      } else {
        // Add props for block at current platform.
        temporaryMap.set(block, {
          componentName,
          description,
          files: [filePath],
          // TODO: remove platform
          readmePath: filePath.replace(/\..+$/, '.md'),
          props: {
            [platform]: props,
          },
        })
      }
    }

    // block modifier case
    if (element === undefined && modifier !== undefined) {
      if (temporaryMap.has(modifier.name)) {
        const prevModifier = temporaryMap.get(modifier.name)
        prevModifier.files = prevModifier.files.concat(filePath)

        if (prevModifier.props[platform] === undefined) {
          // Add other props for same modifier at other platform.
          prevModifier.props[platform] = props
        } else if (props !== undefined) {
          // Add other value for same modifier at current platform.
          prevModifier.props[platform][modifier.name].types.push(...props[modifier.name].types)
        }

        temporaryMap.set(modifier.name, prevModifier)
      } else {
        // Add props for modifier at current platform.
        temporaryMap.set(modifier.name, {
          componentName: undefined,
          description: undefined,
          files: [filePath],
          // TODO: remove platform and mod value
          readmePath: filePath.replace(/\..+$/, '.md'),
          props: {
            [platform]: props,
          },
        })
      }
    }
  }

  return [...temporaryMap.values()]
}
