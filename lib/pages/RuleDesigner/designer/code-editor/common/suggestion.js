// ========================================================
// 提供代码编辑器内容自动完成提示管理
// @author wangyb
// @createTime 2023-06-28 13:40:17
// ========================================================
import { isFunction, flatten } from 'lodash'

// 保存全局注册的建议提供者
const suggestionsProviders = {
}
// 给每个编辑器单独提供
const modelSuggestionsProviders = {
}
const boundMiddlewareLanguages = {

}

const providerBindRef = function (provider, ref) {
  if (!ref) {
    return
  }
  provider.refs = provider.refs || []
  if (provider.refs.includes(ref)) {
    return
  }
  provider.refs.push(ref)
}

export const registerSuggestionsProvider = function (lang, provider, ref) {
  if (!provider) {
    return
  }
  // 绑定关联
  providerBindRef(provider, ref)
  let arr = suggestionsProviders[lang]
  if (!arr) {
    suggestionsProviders[lang] = arr = []
  }
  if (arr.includes(provider)) {
    return
  }
  arr.push(provider)
}

export const registerModelSuggestionsProvider = function (model, provider) {
  if (!provider) {
    return
  }
  let modelId = model.id || ''
  // 绑定关联
  let arr = modelSuggestionsProviders[modelId]
  if (!arr) {
    modelSuggestionsProviders[modelId] = arr = []
  }
  if (arr.includes(provider)) {
    return
  }
  arr.push(provider)
}

export const removeSuggestionsProvider = function (lang, provider, ref) {
  if (!provider) {
    delete suggestionsProviders[lang]
  }
  let arr = suggestionsProviders[lang] || []

  if (provider.refs) {
    let refsIndex = provider.refs.indexOf(ref)
    if (refsIndex !== -1) {
      provider.refs.splice(refsIndex, 1)
    }
  }
  if (!provider.refs || !provider.refs.length) {
    let index = arr.indexOf(provider)
    if (index !== -1) {
      arr.splice(index, 1)
    }
  }
}

export const removeModelSuggestionsProvider = function (model, provider) {
  let modelId = model.id || ''
  if (!provider) {
    delete modelSuggestionsProviders[modelId]
  }
  let arr = modelSuggestionsProviders[modelId] || []

  let index = arr.indexOf(provider)
  if (index !== -1) {
    arr.splice(index, 1)
  }
}

export const suggestionsMiddleware = function (monaco, model, { range }) {
  let language = model.getLanguageIdentifier().language
  // 查询model的提示器
  let providers = modelSuggestionsProviders[model.id] || []
  // 查找语法的提示器
  providers = providers.concat(suggestionsProviders[language] || [])
  // console.log('providers', language, providers, suggestionsProviders)
  return flatten(
    providers.map(provider => {
      if (!isFunction(provider)) {
        return null
      }
      // 组装数据
      return provider()?.map(item => (item && item.label && {
        label: item.label,
        kind: monaco.languages.CompletionItemKind.Function,
        documentation: item.documentation || '',
        insertText: item.insertText,
        range: range
      }))
    }).filter(suggestions => !!suggestions)
  )
}

const blankRegExp = /\s*/

const isBlank = function (str) {
  return blankRegExp.test(str)
}

/**
 * @param {*} monaco 全局对象
 * @param {*} languages 绑定的语言
 * @param {*} options 可选参数
 *                      {
 *                        triggerCharacters: [] // 强制触发的字符
 *                      }
 */
export function bindSuggestionsMiddleware (monaco, languages, { triggerCharacters = ['$'] } = {}) {
  if (!monaco || !languages || !languages.length) {
    return
  }
  languages.forEach(language => {
    if (boundMiddlewareLanguages[language]) {
      return
    }
    boundMiddlewareLanguages[language] = true
    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: function (model, position) {
        // find out if we are completing a property in the 'dependencies' object.
        let word = model.getWordUntilPosition(position)
        if (!word.word) {
          // 特殊字符触发，调整匹配位置，只支持单个字符的触发匹配
          let inputString = model.getValueInRange({
            lineNumber: position.lineNumber,
            column: position.column - 1
          })
          word.word = inputString
          word.startColumn = position.column - 1
        }
        let range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        }
        return {
          suggestions: suggestionsMiddleware(monaco, model, { model, word, range })
        }
      },
      triggerCharacters
    })
  })
}