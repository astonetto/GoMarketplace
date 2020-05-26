import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const savedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:savedProducts',
      );

      if (savedProducts) {
        const parsedProducts: Product[] = JSON.parse(savedProducts);
        setProducts(parsedProducts);
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const newProducts = [...products];
      const index = newProducts.findIndex(product => product.id === id);
      newProducts[index].quantity += 1;

      AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
      setProducts(newProducts);
    },
    [products],
  );

  const decrement = useCallback(
    async (id: string) => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const newProducts = [...products];
      const index = newProducts.findIndex(product => product.id === id);

      if (newProducts[index].quantity === 1) {
        setProducts(newProducts.filter(product => product.id !== id));
      } else {
        newProducts[index].quantity -= 1;
        setProducts(newProducts);
      }

      AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    // TODO ADD A NEW ITEM TO THE CART
    async (product: Omit<Product, 'quantity'>) => {
      const productExists = products.find(
        stateProducts => product.id === stateProducts.id,
      );

      if (productExists) {
        increment(product.id);
      } else {
        const newProduct = { ...product, quantity: 1 };
        setProducts([...products, newProduct]);
        AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify([...products, newProduct]),
        );
      }
    },
    [products, increment],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
