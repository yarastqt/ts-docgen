import { resolve } from 'path'
import { getComponentsMap } from '../src/core/walker'
import { extractMetaFromComponents } from '../src/core/parser'

const source = resolve(__dirname, '__fixtures__/Components1')

describe('parser', () => {
  test('should return array with all information about components', async () => {
    const componentsMap = await getComponentsMap(source)
    for (const [, componentFiles] of componentsMap) {
      const meta = extractMetaFromComponents(componentFiles)
      // console.log(meta)
    }
  })
})
