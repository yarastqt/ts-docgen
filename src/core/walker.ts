import { resolve } from 'path'
import fg from 'fast-glob'

export type ComponentsMap = Map<string, string[]>

const groupFilesByComponentName = (files: string[]): ComponentsMap => {
  const componentsMap = new Map<string, string[]>()
  for (const file of files) {
    const componentName = file.split('/')[0]
    const prevFiles = componentsMap.get(componentName) || []
    componentsMap.set(componentName, [...prevFiles, file])
  }
  return componentsMap
}

const resolveComponentFilesPath = (source: string, componentsMap: ComponentsMap): ComponentsMap => {
  for (const [key, values] of componentsMap.entries()) {
    componentsMap.set(key, values.map((value) => resolve(source, value)))
  }
  return componentsMap
}

/**
 * Return map with component files and grouping them by component name.
 *
 * @param source Components sources
 * @param names Component names for searching
 * @param extensions Available extensions
 */
export const getComponentsMap = async (
  source: string,
  names: string[] = [],
  extensions: string[] = ['ts', 'tsx'],
): Promise<ComponentsMap> => {
  const pattern = `**/*.${extensions.join(',')}`
  const patterns = names.length > 0 ? names.map((name) => `${name}/${pattern}`) : [pattern]
  const filesList = await fg<string>(patterns, { cwd: source })
  const filesMap = groupFilesByComponentName(filesList)
  return resolveComponentFilesPath(source, filesMap)
}
