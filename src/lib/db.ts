import { createClient } from '@/utils/supabase/client'
import { heroProduct, type Product } from '@/data/product'

// Helper to get a supabase client that works on both client and server if needed
// Though for these functions we mostly use the client-side instance
const getSupabase = () => {
  const client = createClient();
  return client;
};

export async function getProducts() {
  const supabase = getSupabase();
  if (!supabase) return [heroProduct];

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase getProducts error:', error.message);
      return [heroProduct];
    }

    if (!data || data.length === 0) return [heroProduct];

    return data.map((p: any) => ({
      id: p.id,
      name: p.product_name,
      slug: p.slug,
      tagline: p.tagline,
      description: p.description,
      category: p.category,
      variants: [
        {
          size: p.bottle_size,
          price: p.price,
          originalPrice: p.discount_price || p.price,
          stock: p.stock,
          sku: `${p.slug}-${p.bottle_size}`
        }
      ],
      images: Array.isArray(p.image_urls) && p.image_urls.length > 0 ? p.image_urls : ['/images/bharathi-oil.png'],
      ingredients: p.ingredients || [],
      benefits: p.benefits || [],
      howToUse: p.how_to_use || '',
      hairTypes: p.hair_types || [],
      storage: p.storage_info || '',
      reviews: [], 
      rating: p.rating || 5.0,
      reviewCount: p.review_count || 0,
      badge: p.badge
    })) as Product[];
  } catch (err) {
    console.error('getProducts exception:', err);
    return [heroProduct];
  }
}

export async function getProductBySlug(slug: string) {
  const supabase = getSupabase();
  if (!supabase) return slug === heroProduct.slug ? heroProduct : null;

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('getProductBySlug error:', error.message);
      if (slug === heroProduct.slug) return heroProduct;
      return null;
    }

    return {
      id: data.id,
      name: data.product_name,
      slug: data.slug,
      tagline: data.tagline,
      description: data.description,
      category: data.category,
      variants: [
        {
          size: data.bottle_size,
          price: data.price,
          originalPrice: data.discount_price || data.price,
          stock: data.stock,
          sku: `${data.slug}-${data.bottle_size}`
        }
      ],
      images: Array.isArray(data.image_urls) ? data.image_urls : ['/images/bharathi-oil.png'],
      ingredients: data.ingredients || [],
      benefits: data.benefits || [],
      howToUse: data.how_to_use || '',
      hairTypes: data.hair_types || [],
      storage: data.storage_info || '',
      reviews: [],
      rating: data.rating || 5.0,
      reviewCount: data.review_count || 0,
      badge: data.badge
    } as Product;
  } catch (err) {
    console.error('getProductBySlug exception:', err);
    return null;
  }
}
