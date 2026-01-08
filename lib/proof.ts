import { ed25519 } from '@noble/ed25519'
import * as jsonld from '@digitalbazaar/jsonld'
import bs58 from 'bs58'
import { Ed25519Signature2020Proof } from '@/types/obv3'

/**
 * Generate a DID key identifier from an Ed25519 public key
 * Format: did:key:z{multibase-base58btc-encoded-public-key}
 * 
 * According to did:key spec:
 * - Prepend multicodec prefix 0xed01 (Ed25519 public key)
 * - Encode in multibase base58btc (prefix 'z')
 */
export function generateDidKey(publicKey: Uint8Array): string {
  if (publicKey.length !== 32) {
    throw new Error('Ed25519 public key must be 32 bytes')
  }
  
  // Multicodec prefix for Ed25519 public key: 0xed01
  // In varint encoding, 0xed01 is encoded as [0xed, 0x01]
  const multicodecPrefix = new Uint8Array([0xed, 0x01])
  const prefixedKey = new Uint8Array(multicodecPrefix.length + publicKey.length)
  prefixedKey.set(multicodecPrefix, 0)
  prefixedKey.set(publicKey, multicodecPrefix.length)
  
  // Encode in base58btc (bs58 uses base58btc by default)
  const encoded = bs58.encode(prefixedKey)
  
  return `did:key:z${encoded}`
}

/**
 * Parse a private key from string (hex or base58)
 */
export function parsePrivateKey(keyString: string): Uint8Array {
  // Try hex first
  if (/^[0-9a-fA-F]{64}$/.test(keyString)) {
    return Uint8Array.from(Buffer.from(keyString, 'hex'))
  }
  
  // Try base58 (simplified - for production use proper base58 library)
  // For now, assume hex format
  throw new Error('Private key must be in hex format (64 hex characters)')
}

/**
 * Derive public key from private key
 */
export function derivePublicKey(privateKey: Uint8Array): Uint8Array {
  return ed25519.getPublicKey(privateKey)
}

/**
 * Canonicalize JSON-LD document for signing
 * Removes proof field and canonicalizes according to JSON-LD spec
 */
export async function canonicalizeJsonLd(document: Record<string, unknown>): Promise<string> {
  // Remove proof field if present (we'll add it back after signing)
  const documentWithoutProof = { ...document }
  delete documentWithoutProof.proof
  
  // Use JSON-LD canonicalization
  // The @digitalbazaar/jsonld library provides canonicalization
  const canonical = await jsonld.canonize(documentWithoutProof, {
    algorithm: 'URDNA2015',
    format: 'application/n-quads'
  })
  
  return canonical
}

/**
 * Generate Ed25519Signature2020 proof for a credential
 */
export async function generateProof(
  credential: Record<string, unknown>,
  privateKey: Uint8Array,
  didKey: string
): Promise<Ed25519Signature2020Proof> {
  // Canonicalize the credential (without proof)
  const canonical = await canonicalizeJsonLd(credential)
  
  // Sign the canonicalized document
  const message = new TextEncoder().encode(canonical)
  const signature = await ed25519.sign(message, privateKey)
  
  // Encode signature in base58btc (multibase format)
  // For Ed25519Signature2020, proofValue is base58btc-encoded signature with 'z' prefix
  const encoded = bs58.encode(signature)
  const proofValue = `z${encoded}`
  
  // Create verification method (DID key with fragment)
  const verificationMethod = `${didKey}#${didKey.split(':').pop()}`
  
  return {
    type: 'Ed25519Signature2020',
    created: new Date().toISOString(),
    verificationMethod,
    proofPurpose: 'assertionMethod',
    proofValue
  }
}

/**
 * Get or generate DID key for a tenant
 * If keys are provided in config, use them; otherwise generate new ones
 */
export function getOrGenerateDidKey(
  privateKeyString?: string,
  publicKeyString?: string,
  didKeyString?: string
): { privateKey: Uint8Array; publicKey: Uint8Array; didKey: string } {
  let privateKey: Uint8Array
  let publicKey: Uint8Array
  let didKey: string
  
  if (privateKeyString) {
    // Use provided private key
    privateKey = parsePrivateKey(privateKeyString)
    publicKey = derivePublicKey(privateKey)
    
    if (didKeyString) {
      didKey = didKeyString
    } else if (publicKeyString) {
      // Try to parse provided public key
      const providedPublicKey = /^[0-9a-fA-F]{64}$/.test(publicKeyString)
        ? Uint8Array.from(Buffer.from(publicKeyString, 'hex'))
        : null
      
      if (providedPublicKey?.length === 32) {
        didKey = generateDidKey(providedPublicKey)
      } else {
        didKey = generateDidKey(publicKey)
      }
    } else {
      didKey = generateDidKey(publicKey)
    }
  } else {
    // Generate new key pair (for development/testing)
    // In production, keys should always be provided via environment
    console.warn('⚠️ No issuer private key provided. Generating temporary key pair for development.')
    privateKey = ed25519.utils.randomPrivateKey()
    publicKey = derivePublicKey(privateKey)
    didKey = generateDidKey(publicKey)
  }
  
  return { privateKey, publicKey, didKey }
}
