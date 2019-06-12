import { resolve } from 'path'
import fg from 'fast-glob'

export type FilesMap = Record<string, string[]>

const groupFilesByComponentName = (files: string[]): FilesMap => {
  return files.reduce<FilesMap>((acc, filePath) => {
    const componentName = filePath.split('/')[0]
    if (acc[componentName] === undefined) {
      acc[componentName] = []
    }
    acc[componentName].push(filePath)
    return acc
  }, {})
}

const resolveFilesPath = (src: string, filesMap: FilesMap): FilesMap => {
  return Object.entries(filesMap).reduce<FilesMap>(
    (acc, [componentName, componentFiles]) => ({
      ...acc,
      [componentName]: componentFiles.map((componentFile) => resolve(src, componentFile)),
    }),
    {},
  )
}

/**
 * Return map with component files and grouping by component name.
 *
 * @param source Components sources
 * @param names Component names for searching
 * @param extensions Available extensions
 */
export const getComponentFiles = async (
  source: string,
  names: string[] = [],
  extensions: string[] = ['tsx'],
): Promise<FilesMap> => {
  const pattern = `**/*.${extensions.join(',')}`
  const patterns = names.length > 0 ? names.map((name) => `${name}/${pattern}`) : [pattern]
  const filesList = await fg<string>(patterns, { cwd: source })
  const filesMap = groupFilesByComponentName(filesList)
  return resolveFilesPath(source, filesMap)
}
