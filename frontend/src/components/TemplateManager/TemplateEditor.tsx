/**
 * Template Editor Component
 * 
 * Edit template customizations with validation and testing
 */

'use client';

import { useState, useEffect } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';

interface TemplatePreview {
  templateId: string;
  name: string;
  basePrompt: string;
  customizedPrompt?: string;
  hasCustomization: boolean;
  customVariables?: Record<string, any>;
  customInstructions?: string;
}

interface AvailableVariable {
  name: string;
  description: string;
  type?: string;
  required: boolean;
  default?: string;
  examples?: string[];
}

export function TemplateEditor({ templateId }: { templateId: string }) {
  const { userProfile } = useUserProfile();
  const [preview, setPreview] = useState<TemplatePreview | null>(null);
  const [availableVariables, setAvailableVariables] = useState<AvailableVariable[]>([]);
  const [customVariables, setCustomVariables] = useState<Record<string, any>>({});
  const [customInstructions, setCustomInstructions] = useState('');
  const [validation, setValidation] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplate();
    loadVariables();
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      const response = await fetch(`/api/user-templates/${templateId}/preview`);
      const data = await response.json();
      setPreview(data);
      setCustomVariables(data.customVariables || {});
      setCustomInstructions(data.customInstructions || '');
    } catch (error) {
      console.error('Failed to load template', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVariables = async () => {
    try {
      const response = await fetch(`/api/user-templates/${templateId}/variables`);
      const data = await response.json();
      setAvailableVariables(data.variables || []);
    } catch (error) {
      console.error('Failed to load variables', error);
    }
  };

  const validateCustomization = async () => {
    try {
      const response = await fetch(`/api/user-templates/${templateId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customVariables,
          customInstructions,
        }),
      });
      const data = await response.json();
      setValidation(data);
    } catch (error) {
      console.error('Validation failed', error);
    }
  };

  const testCustomization = async () => {
    try {
      const response = await fetch(`/api/user-templates/${templateId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customVariables,
          customInstructions,
        }),
      });
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      console.error('Test failed', error);
    }
  };

  const saveCustomization = async () => {
    try {
      const response = await fetch(`/api/user-templates/${templateId}/customize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customVariables,
          customInstructions,
        }),
      });
      const data = await response.json();
      setPreview(data.preview);
      alert('Customization saved successfully!');
    } catch (error) {
      console.error('Save failed', error);
      alert('Failed to save customization');
    }
  };

  if (loading) {
    return <div>Loading template...</div>;
  }

  if (!preview) {
    return <div>Template not found</div>;
  }

  return (
    <div className="template-editor">
      <h2>{preview.name}</h2>

      <div className="editor-tabs">
        <button>Variables</button>
        <button>Instructions</button>
        <button>Preview</button>
        <button>Compare</button>
      </div>

      <div className="variables-section">
        <h3>Custom Variables</h3>
        {availableVariables.map((variable) => (
          <div key={variable.name} className="variable-input">
            <label>
              {variable.name}
              {variable.required && <span className="required">*</span>}
            </label>
            <input
              type="text"
              value={customVariables[variable.name] || variable.default || ''}
              onChange={(e) =>
                setCustomVariables({
                  ...customVariables,
                  [variable.name]: e.target.value,
                })
              }
            />
            {variable.description && (
              <p className="variable-description">{variable.description}</p>
            )}
            {variable.examples && (
              <p className="variable-examples">
                Examples: {variable.examples.join(', ')}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="instructions-section">
        <h3>Custom Instructions</h3>
        <textarea
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
          placeholder="Add custom instructions..."
          rows={5}
        />
      </div>

      <div className="actions">
        <button onClick={validateCustomization}>Validate</button>
        <button onClick={testCustomization}>Test</button>
        <button onClick={saveCustomization} className="primary">
          Save
        </button>
      </div>

      {validation && (
        <div className={`validation-result ${validation.valid ? 'valid' : 'invalid'}`}>
          <h4>Validation Result</h4>
          {validation.errors.length > 0 && (
            <div className="errors">
              {validation.errors.map((error: any, i: number) => (
                <div key={i} className="error">
                  {error.message}
                </div>
              ))}
            </div>
          )}
          {validation.warnings.length > 0 && (
            <div className="warnings">
              {validation.warnings.map((warning: string, i: number) => (
                <div key={i} className="warning">
                  {warning}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {testResult && (
        <div className="test-result">
          <h4>Test Result</h4>
          <pre>{testResult.renderedPrompt}</pre>
        </div>
      )}
    </div>
  );
}
