import axios from 'axios';
import crypto from 'crypto';

export interface ShopifyWebhook {
  id: string;
  topic: string;
  shop: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  description?: string;
  vendor?: string;
  product_type?: string;
  tags?: string;
  variants?: Array<{
    id: string;
    title: string;
    price: string;
    sku?: string;
  }>;
  images?: Array<{
    src: string;
    alt?: string;
  }>;
  created_at: string;
  updated_at: string;
}

export class ShopifyAdapter {
  private apiKey: string;
  private apiSecret: string;
  private storeUrl: string;

  constructor() {
    this.apiKey = process.env.SHOPIFY_API_KEY || '';
    this.apiSecret = process.env.SHOPIFY_API_SECRET || '';
    this.storeUrl = process.env.SHOPIFY_STORE_URL || '';
  }

  /**
   * Verify Shopify webhook signature
   */
  verifyWebhookSignature(
    body: string,
    signature: string,
    secret: string = this.apiSecret
  ): boolean {
    const hmac = crypto.createHmac('sha256', secret);
    const hash = hmac.update(body, 'utf8').digest('base64');
    return hash === signature;
  }

  /**
   * Parse Shopify webhook payload
   */
  parseWebhook(body: any, headers: Record<string, string>): ShopifyWebhook | null {
    try {
      const signature = headers['x-shopify-hmac-sha256'] || headers['X-Shopify-Hmac-Sha256'];
      
      if (!signature) {
        console.warn('Missing Shopify webhook signature');
        return null;
      }

      const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
      
      if (!this.verifyWebhookSignature(bodyString, signature)) {
        console.error('Invalid Shopify webhook signature');
        return null;
      }

      const data = typeof body === 'object' ? body : JSON.parse(bodyString);
      const topic = headers['x-shopify-topic'] || headers['X-Shopify-Topic'] || '';
      const shop = headers['x-shopify-shop-domain'] || headers['X-Shopify-Shop-Domain'] || '';

      return {
        id: data.id || crypto.randomUUID(),
        topic,
        shop,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error parsing Shopify webhook:', error);
      return null;
    }
  }

  /**
   * Fetch product details from Shopify API
   */
  async fetchProduct(productId: string): Promise<ShopifyProduct | null> {
    if (!this.apiKey || !this.storeUrl) {
      console.warn('Shopify credentials not configured');
      return null;
    }

    try {
      const url = `https://${this.storeUrl}/admin/api/2024-01/products/${productId}.json`;
      const response = await axios.get(url, {
        headers: {
          'X-Shopify-Access-Token': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      return response.data?.product || null;
    } catch (error) {
      console.error('Error fetching Shopify product:', error);
      return null;
    }
  }

  /**
   * Convert Shopify webhook topic to internal event type
   */
  topicToEventType(topic: string): string {
    const mapping: Record<string, string> = {
      'products/create': 'shopify.product.created',
      'products/update': 'shopify.product.updated',
      'products/delete': 'shopify.product.deleted',
      'collections/create': 'shopify.collection.created',
      'collections/update': 'shopify.collection.updated',
      'orders/create': 'shopify.order.created',
      'orders/paid': 'shopify.order.paid',
      'orders/fulfilled': 'shopify.order.fulfilled',
      'inventory_levels/update': 'shopify.inventory.low',
      'customers/create': 'shopify.customer.created',
      'customers/update': 'shopify.customer.updated',
    };

    return mapping[topic] || `shopify.${topic.replace('/', '.')}`;
  }

  /**
   * Check if product inventory is low
   */
  async checkInventoryLevels(productId: string, threshold: number = 10): Promise<boolean> {
    if (!this.apiKey || !this.storeUrl) {
      return false;
    }

    try {
      const url = `https://${this.storeUrl}/admin/api/2024-01/products/${productId}/variants.json`;
      const response = await axios.get(url, {
        headers: {
          'X-Shopify-Access-Token': this.apiKey,
        },
      });

      const variants = response.data?.variants || [];
      return variants.some((v: any) => (v.inventory_quantity || 0) < threshold);
    } catch (error) {
      console.error('Error checking inventory:', error);
      return false;
    }
  }

  /**
   * Get recent products (for polling fallback)
   */
  async getRecentProducts(limit: number = 10): Promise<ShopifyProduct[]> {
    if (!this.apiKey || !this.storeUrl) {
      return [];
    }

    try {
      const url = `https://${this.storeUrl}/admin/api/2024-01/products.json?limit=${limit}`;
      const response = await axios.get(url, {
        headers: {
          'X-Shopify-Access-Token': this.apiKey,
        },
      });

      return response.data?.products || [];
    } catch (error) {
      console.error('Error fetching recent products:', error);
      return [];
    }
  }
}

export const shopifyAdapter = new ShopifyAdapter();
