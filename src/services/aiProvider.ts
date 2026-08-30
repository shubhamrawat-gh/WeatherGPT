export interface AIProvider {
  id: string
  name: string
  description: string
  capabilities: string[]
  supportedFormats: string[]
}

export interface AnalysisConfig {
  providerId: string
  selectedModules: string[]
  filesCount: number
}

export const AVAILABLE_PROVIDERS: AIProvider[] = [
  {
    id: 'gemini',
    name: 'Google Gemini Pro Vision',
    description: 'High-accuracy multimodal analysis, damage severity classification, and context-aware executive summaries.',
    capabilities: ['damage_assessment', 'infrastructure_analysis', 'situational_intelligence', 'risk_assessment'],
    supportedFormats: ['images', 'satellite', 'drone', 'photos']
  },
  {
    id: 'huggingface',
    name: 'Hugging Face Hub (Custom Models)',
    description: 'Specialized computer vision pipelines for object detection, segmentation, and flood/wildfire damage assessment.',
    capabilities: ['damage_assessment', 'resource_detection', 'risk_assessment'],
    supportedFormats: ['images', 'satellite', 'drone', 'photos']
  },
  {
    id: 'openai',
    name: 'OpenAI GPT-4o Multimodal',
    description: 'Structured metadata extraction, infrastructure hazard identification, and responder coordination summaries.',
    capabilities: ['infrastructure_analysis', 'resource_detection', 'situational_intelligence'],
    supportedFormats: ['images', 'photos', 'documents']
  },
  {
    id: 'local_model',
    name: 'Local Edge Inference (YOLO / MobileNet)',
    description: 'Low-latency, offline-compatible edge models for real-time asset tracking and hazard warning coordinates.',
    capabilities: ['damage_assessment', 'resource_detection'],
    supportedFormats: ['images', 'drone', 'photos']
  },
  {
    id: 'custom_vision',
    name: 'Custom Satellite Imagery Pipeline',
    description: 'Proprietary SAR and multispectral analysis models for landscape flooding boundary tracking and wildfire progression.',
    capabilities: ['damage_assessment', 'infrastructure_analysis', 'risk_assessment'],
    supportedFormats: ['satellite']
  }
]

export function getProviderById(id: string): AIProvider | undefined {
  return AVAILABLE_PROVIDERS.find(p => p.id === id)
}
