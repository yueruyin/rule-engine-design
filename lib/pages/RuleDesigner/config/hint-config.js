/**
 * 提示配置
 * @author wangyb
 * @createTime 2023-04-18 16:20:56
 */
export const HIT_RESULT_PATH_RULE = `// 参考文档 https://pkg.go.dev/github.com/tidwall/gjson#pkg-overview
{
  "name": {"first": "Tom", "last": "Anderson"},
  "age":37,
  "children": ["Sara","Alex","Jack"],
  "fav.movie": "Deer Hunter",
  "friends": [
    {"first": "Dale", "last": "Murphy", "age": 44, "nets": ["ig", "fb", "tw"]},
    {"first": "Roger", "last": "Craig", "age": 68, "nets": ["fb", "tw"]},
    {"first": "Jane", "last": "Murphy", "age": 47, "nets": ["ig", "tw"]}
  ]
}
name.last          // "Anderson"
age                // 37
children           // ["Sara","Alex","Jack"]
children.#         // 3
children.1         // "Alex"
child*.2           // "Jack"
c?ildren.0         // "Sara"
fav\.movie          // "Deer Hunter"
friends.#.first    // ["Dale","Roger","Jane"]
friends.1.last     // "Craig"
// 数组过滤
friends.#(last=="Murphy").first    // "Dale"
friends.#(last=="Murphy")#.first   // ["Dale","Jane"]
friends.#(age>45)#.last            // ["Craig","Murphy"]
friends.#(first%"D*").last         // "Murphy"
friends.#(first!%"D*").last        // "Craig"
friends.#(nets.#(=="fb"))#.first   // ["Dale","Roger"]
`

export const HIT_BODY_CONFIG_RULE = `// 必须是标准的JSON格式
{
  "$变量名": 1, // 变量需要用""包裹起来，且不能有多余的空格
  "name": "$变量值"
}`