/**
 * 蕾姆精心设计的加密工具
 * 使用 Web Crypto API (AES-GCM) 实现安全的本地加密存储
 *
 * 安全特性：
 * - 使用 AES-GCM 256 位加密算法
 * - 每次加密都使用唯一的 IV（初始化向量）
 * - 密钥基于应用标识符生成
 * - 防止密钥明文存储在 localStorage 中
 */

// ========================================
// 配置常量
// ========================================

// 蕾姆的密钥派生 Salt（固定值，用于生成加密密钥）
const ENCRYPTION_KEY_SALT = 'Onir-Rem-Key-Salt-2024'
const APP_IDENTIFIER = 'com.moxiang.onir'

// ========================================
// 类型定义
// ========================================

interface EncryptedData {
  // 加密后的数据（Base64 编码）
  ciphertext: string
  // 初始化向量（Base64 编码）
  iv: string
}

// ========================================
// 核心加密函数
// ========================================

/**
 * 从应用标识符生成加密密钥
 * 使用 PBKDF2 算法从固定 Salt 生成密钥
 */
async function deriveEncryptionKey(): Promise<CryptoKey> {
  // 将应用标识符转换为密钥材料
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(APP_IDENTIFIER + ENCRYPTION_KEY_SALT),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  // 使用 PBKDF2 派生 AES-GCM 密钥
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode(ENCRYPTION_KEY_SALT),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * 加密字符串数据
 * @param plaintext 明文数据
 * @returns 加密后的数据对象（包含密文和 IV）
 */
export async function encrypt(plaintext: string): Promise<EncryptedData> {
  try {
    // 生成加密密钥
    const key = await deriveEncryptionKey()

    // 生成随机初始化向量（IV）
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // 加密数据
    const encodedData = new TextEncoder().encode(plaintext)
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    )

    // 转换为 Base64 格式存储
    return {
      ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
      iv: btoa(String.fromCharCode(...iv)),
    }
  } catch (error) {
    console.error('蕾姆：加密失败', error)
    throw new Error('数据加密失败')
  }
}

/**
 * 解密字符串数据
 * @param encryptedData 加密的数据对象
 * @returns 明文数据
 */
export async function decrypt(encryptedData: EncryptedData): Promise<string> {
  try {
    // 生成加密密钥
    const key = await deriveEncryptionKey()

    // 从 Base64 转换回原始数据
    const ciphertext = Uint8Array.from(atob(encryptedData.ciphertext), c => c.charCodeAt(0))
    const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0))

    // 解密数据
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    )

    // 转换为字符串
    return new TextDecoder().decode(decryptedData)
  } catch (error) {
    console.error('蕾姆：解密失败', error)
    throw new Error('数据解密失败')
  }
}

/**
 * 加密对象并转换为 JSON 字符串
 * @param obj 要加密的对象
 * @returns 加密后的 JSON 字符串（用于存储）
 */
export async function encryptObject<T>(obj: T): Promise<string> {
  const plaintext = JSON.stringify(obj)
  const encrypted = await encrypt(plaintext)
  return JSON.stringify(encrypted)
}

/**
 * 解密 JSON 字符串并转换为对象
 * @param encryptedJson 加密的 JSON 字符串
 * @returns 解密后的对象
 */
export async function decryptObject<T>(encryptedJson: string): Promise<T> {
  const encrypted: EncryptedData = JSON.parse(encryptedJson)
  const plaintext = await decrypt(encrypted)
  return JSON.parse(plaintext) as T
}

// ========================================
// 工具函数
// ========================================

/**
 * 检查数据是否为加密格式
 * 通过检查是否包含 ciphertext 和 iv 字段来判断
 */
export function isEncrypted(data: string): boolean {
  try {
    const parsed = JSON.parse(data)
    return typeof parsed === 'object' &&
           'ciphertext' in parsed &&
           'iv' in parsed
  } catch {
    return false
  }
}
