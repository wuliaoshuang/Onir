/**
 * 蕾姆精心重构的对话标题生成服务
 * ✨ 修复严重 bug：现在根据模型使用正确的 API endpoint
 * ✨ 支持 Google AI 完全不同的 API 格式
 */

export interface TitleGeneratorOptions {
  apiKey: string
  baseUrl?: string
  providerId?: string
  model?: string
}

// ========================================
// Google AI 请求/响应格式
// ========================================
interface GoogleContent {
  role: 'user' | 'model'
  parts: Array<{ text: string }>
}

interface GoogleGenerateContentRequest {
  contents: GoogleContent[]
  generationConfig?: {
    temperature?: number
    maxOutputTokens?: number
  }
}

interface GoogleCandidate {
  content?: {
    parts: Array<{ text?: string }>
  }
  finishReason?: string
}

interface GenerateContentResponse {
  candidates: GoogleCandidate[]
}

/**
 * 生成对话标题
 *
 * @param firstMessage - 用户的第一条消息
 * @param options - API 配置
 * @returns 生成的标题（5-10个汉字）
 */
export async function generateTitle(
  firstMessage: string,
  options: TitleGeneratorOptions
): Promise<string> {
  const { apiKey, baseUrl = 'https://api.deepseek.com', providerId = 'deepseek', model = 'deepseek-chat' } = options

  // 🎯 蕾姆：检测 Google AI
  const isGoogleAI = providerId === 'google' ||
                     baseUrl.includes('generativelanguage.googleapis.com') ||
                     baseUrl.includes('googleapis.com')

  if (isGoogleAI) {
    return generateTitleWithGoogleAI(firstMessage, { apiKey, baseUrl, model })
  }

  // 🎯 蕾姆：OpenAI 兼容格式
  return generateTitleWithOpenAI(firstMessage, { apiKey, baseUrl, model })
}

/**
 * 使用 Google AI 生成标题
 * Google AI 使用完全不同的 API 格式
 */
async function generateTitleWithGoogleAI(
  firstMessage: string,
  options: { apiKey: string; baseUrl?: string; model?: string }
): Promise<string> {
  const { apiKey, baseUrl = 'https://generativelanguage.googleapis.com', model = 'gemini-2.5-flash' } = options

  const url = `${baseUrl.replace(/\/$/, '')}/v1beta/models/${model}:generateContent`

  const systemPrompt = '你是一个对话标题生成助手。请根据用户的第一条消息，生成一个简短的对话标题（5-10个汉字）。直接返回标题，不要有任何解释、引号或额外文字。标题应该简洁明了，能够概括对话的主题。'

  const requestBody: GoogleGenerateContentRequest = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${systemPrompt}\n\n请为以下对话生成一个标题：\n${firstMessage.slice(0, 200)}` },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 50,
    },
  }

  try {
    console.log('🔍 蕾姆调试：Google AI 标题生成请求', { url, model })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Google AI 标题生成失败:', errorData)
      throw new Error(errorData.error?.message || '请求失败')
    }

    const data: GenerateContentResponse = await response.json()
    // Google AI 响应格式: candidates[0].content.parts[0].text
    let title = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''

    console.log('🔍 蕾姆调试：Google AI 标题生成响应', { title })

    // 清理可能的引号和特殊字符
    title = title.replace(/^["'『「【]|["'』」】]$/g, '').trim()

    // 如果标题过长，截断
    if (title.length > 15) {
      title = title.slice(0, 13) + '..'
    }

    return title
  } catch (error) {
    console.error('Google AI 生成标题失败:', error)
    throw error
  }
}

/**
 * 使用 OpenAI 兼容 API 生成标题
 */
async function generateTitleWithOpenAI(
  firstMessage: string,
  options: { apiKey: string; baseUrl?: string; model?: string }
): Promise<string> {
  const { apiKey, baseUrl, model = 'deepseek-chat' } = options

  const url = `${baseUrl.replace(/\/$/, '')}/v1/chat/completions`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: '你是一个对话标题生成助手。请根据用户的第一条消息，生成一个简短的对话标题（5-10个汉字）。直接返回标题，不要有任何解释、引号或额外文字。标题应该简洁明了，能够概括对话的主题。',
          },
          {
            role: 'user',
            content: `请为以下对话生成一个标题：\n${firstMessage.slice(0, 200)}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 50,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('标题生成失败:', errorData)
      throw new Error(errorData.error?.message || '请求失败')
    }

    const data = await response.json()
    let title = data.choices?.[0]?.message?.content?.trim() || ''

    // 清理可能的引号和特殊字符
    title = title.replace(/^["'『「【]|["'』」】]$/g, '').trim()

    // 如果标题过长，截断
    if (title.length > 15) {
      title = title.slice(0, 13) + '..'
    }

    return title
  } catch (error) {
    console.error('生成标题失败:', error)
    throw error
  }
}
