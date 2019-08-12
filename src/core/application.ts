import { resolve } from 'path'
import { existsSync, writeFileSync } from 'fs'

import { getComponentsMap } from './walker'
import { extractMetaFromComponents } from './parser'
import { jsDocResolver } from './resolvers/jsdoc-resolver'
import { EnhancedResolverData, Resolver } from './resolvers/interface'
import { bemAdapter } from './adapters/bem-adapter'

const __FIXTURES__ = resolve(__dirname, '../../__tests__/__fixtures__/Module1')

// const booleanFold = () => {}

type Config = {
  source: string
  adapters: (meta: EnhancedResolverData[]) => any[]
  resolvers: Resolver[]
  i18n: any
}

const generate = async ({ source, adapters, resolvers, i18n }: Config) => {
  // TODO: validate all params for exists.
  const componentsMap = await getComponentsMap(source, ['Component1'])

  // TODO: нужно придумать сущьность для склейки типов

  // TODO: Нужно придумать к какому формату приводить данные из адаптеров,
  // чтобы можно было это масштабировать, возможно будут кастомные рендеры.

  // Возможно это будет как с адаптерами, типо bemRender, т.к. адаптер готовит данные для конкретного рендера.



  // Сейчас нужно придумать как обработать данные перед рендером и отдать их в рендер (подумать сразу про мультиязычность)
  // так же нужно продумать кейс, когда хотим записать в один md файл модификатор и компонент
  for (const [, componentFiles] of componentsMap) {
    const meta = extractMetaFromComponents(componentFiles, resolvers)

    // @ts-ignore
    const processedMeta = adapters.reduce((value, adapter) => {
      return adapter(value)
    }, meta)


    // Язык с default будет без префикса - например если default ru, то будет readme.md and readme.en.md, возможно стоит как-то сделать дефолтные значение
    // if (i18n === undefined) {
    //   for (const m of processedMeta) {
    //     // Эта часть будет называться — writer
    //     if (existsSync(m.readmePath)) {

    //     } else {
    //       writeFileSync(m.readmePath, JSON.stringify(m.props))
    //     }
    //   }
    // }







    // console.log(processedMeta)
  }
}

// ts-docgen.config.js
const config = {
  source: __FIXTURES__,
  // single value???
  resolvers: [jsDocResolver],
  // single value???
  adapters: [bemAdapter],

  // i18n: []

  i18n: {
    langs: ['en', 'ru'],
    default: 'ru',
    // adapters: [],
  },

  renderer: () => {
    // тут кажется стоит так же описывать регулярки которые стоит заменить (мб в виде патерна)
    return null
  },

  writer: () => {
    return null
  },
}

// @ts-ignore
generate(config)



// Схема walker -> parser -> resolver -> dataAdapter (mapper???) -> renderAdapter -> render
