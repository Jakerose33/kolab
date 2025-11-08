// Client-side content moderation utilities
export interface ContentModerationResult {
  isAppropriate: boolean;
  confidence: number;
  flags: string[];
  cleanedContent?: string;
}

// Simple keyword-based content filter for client-side pre-filtering
export class ContentModerationClient {
  private static inappropriate = [
    // Add inappropriate content patterns here
    'spam', 'scam', 'fake', 'illegal',
  ];

  private static suspicious = [
    'urgent', 'limited time', 'act now', 'guarantee',
  ];

  static moderateText(content: string): ContentModerationResult {
    const lowerContent = content.toLowerCase();
    const flags: string[] = [];
    let confidence = 1.0;
    let isAppropriate = true;

    // Check for inappropriate content
    this.inappropriate.forEach(word => {
      if (lowerContent.includes(word)) {
        flags.push(`inappropriate:${word}`);
        confidence -= 0.3;
        isAppropriate = false;
      }
    });

    // Check for suspicious content
    this.suspicious.forEach(word => {
      if (lowerContent.includes(word)) {
        flags.push(`suspicious:${word}`);
        confidence -= 0.1;
      }
    });

    // Check for excessive capitalization
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.5 && content.length > 10) {
      flags.push('excessive_caps');
      confidence -= 0.2;
    }

    // Check for excessive punctuation
    const punctRatio = (content.match(/[!?]/g) || []).length / content.length;
    if (punctRatio > 0.1) {
      flags.push('excessive_punctuation');
      confidence -= 0.1;
    }

    // Clean content by normalizing
    const cleanedContent = content
      .replace(/(.)\1{3,}/g, '$1$1$1') // Remove excessive repetition
      .replace(/[!?]{2,}/g, '!') // Normalize punctuation
      .trim();

    return {
      isAppropriate: isAppropriate && confidence > 0.5,
      confidence: Math.max(0, Math.min(1, confidence)),
      flags,
      cleanedContent,
    };
  }

  static moderateImage(file: File): Promise<ContentModerationResult> {
    return new Promise((resolve) => {
      // Basic file validation
      const flags: string[] = [];
      let isAppropriate = true;

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        flags.push('oversized');
        isAppropriate = false;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        flags.push('invalid_type');
        isAppropriate = false;
      }

      // For now, we'll approve all valid images
      // In production, you'd integrate with a service like AWS Rekognition
      resolve({
        isAppropriate,
        confidence: isAppropriate ? 0.8 : 0.2,
        flags,
      });
    });
  }

  static generateModerationReport(results: ContentModerationResult[]): {
    overallScore: number;
    recommendation: 'approve' | 'review' | 'reject';
    summary: string;
  } {
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    const inappropriateCount = results.filter(r => !r.isAppropriate).length;
    const totalFlags = results.reduce((sum, r) => sum + r.flags.length, 0);

    let recommendation: 'approve' | 'review' | 'reject';
    let summary: string;

    if (inappropriateCount === 0 && avgConfidence > 0.8) {
      recommendation = 'approve';
      summary = 'Content appears appropriate and safe.';
    } else if (inappropriateCount > results.length / 2 || avgConfidence < 0.3) {
      recommendation = 'reject';
      summary = 'Content contains inappropriate material or suspicious patterns.';
    } else {
      recommendation = 'review';
      summary = 'Content requires manual review due to moderate risk factors.';
    }

    return {
      overallScore: avgConfidence,
      recommendation,
      summary,
    };
  }
}

// React hook for content moderation
export function useContentModeration() {
  const moderateText = (content: string) => {
    return ContentModerationClient.moderateText(content);
  };

  const moderateImage = async (file: File) => {
    return ContentModerationClient.moderateImage(file);
  };

  const validateContent = (content: string): { isValid: boolean; message?: string } => {
    const result = moderateText(content);
    
    if (!result.isAppropriate) {
      return {
        isValid: false,
        message: 'Content contains inappropriate material. Please revise and try again.',
      };
    }

    if (result.confidence < 0.6) {
      return {
        isValid: false,
        message: 'Content may contain suspicious patterns. Please review and modify.',
      };
    }

    return { isValid: true };
  };

  return {
    moderateText,
    moderateImage,
    validateContent,
  };
}