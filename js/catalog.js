(() => {
  const storageKey = 'solestyle-products';
  const defaults = [
    { id: 'air-max-1', name: "Air Max 1 '87", brand: 'Nike', price: 149.99, category: ['homem', 'unissexo'], color: 'Branco / Vermelho', colors: ['Branco / Vermelho', 'Preto / Branco', 'Branco / Azul'], description: 'Um ícone que atravessa gerações. Amortecimento visível e uma combinação de cores feita para se destacar, dentro e fora da rua.', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85', badge: 'Ícone' },
    { id: '530', name: '530', brand: 'New Balance', price: 119.99, category: ['mulher', 'unissexo'], color: 'Prateado / Branco', colors: ['Prateado / Branco', 'Branco / Azul', 'Cinza / Rosa'], description: 'Inspiradas na corrida dos anos 2000, as 530 juntam linhas retro, malha respirável e conforto para o ritmo de todos os dias.', image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=85', badge: 'Novo' },
    { id: 'samba-og', name: 'Samba OG', brand: 'adidas', price: 110, category: ['homem', 'mulher', 'unissexo'], color: 'Preto / Branco', colors: ['Preto / Branco', 'Branco / Verde', 'Branco / Preto'], description: 'Nascida nos campos de futebol e adotada pela cidade. Pele macia, perfil baixo e uma silhueta que nunca sai de cena.', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=85', badge: 'Favorito' },
    { id: 'gel-1130', name: 'GEL-1130', brand: 'ASICS', price: 100, category: ['mulher', 'unissexo'], color: 'Cinza / Verde', colors: ['Cinza / Verde', 'Branco / Azul', 'Preto / Prateado'], description: 'Conforto inspirado na corrida de longa distância. A tecnologia GEL e os apontamentos em verde dão nova energia a um clássico.', image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=85', badge: 'Últimos pares' },
    { id: '9060', name: '9060', brand: 'New Balance', price: 190, category: ['homem', 'unissexo'], color: 'Creme / Cinza', colors: ['Creme / Cinza', 'Azul / Branco', 'Preto / Cinza'], description: 'Uma interpretação expressiva da herança New Balance. Proporções marcantes, camadas de camurça e conforto sem esforço.', image: 'https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?auto=format&fit=crop&w=1000&q=85', badge: '' },
    { id: 'xt-6', name: 'XT-6', brand: 'Salomon', price: 180, category: ['homem', 'mulher', 'unissexo'], color: 'Preto / Cinza', colors: ['Preto / Cinza', 'Branco / Cinza', 'Verde / Preto'], description: 'Pronta para sair do asfalto. A XT-6 combina estabilidade, proteção e uma presença técnica que também pertence à cidade.', image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1000&q=85', badge: 'Novo' }
  ];

  function list() {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === null) return defaults.map(product => ({ ...product, category: [...product.category], colors: [...product.colors] }));
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.filter(product => product && typeof product.id === 'string' && typeof product.name === 'string' && Number.isFinite(Number(product.price))) : [];
    } catch {
      return defaults.map(product => ({ ...product, category: [...product.category], colors: [...product.colors] }));
    }
  }

  function save(products) {
    localStorage.setItem(storageKey, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('solestyle:catalog-updated', { detail: { products } }));
  }

  window.soleStyleCatalog = { list, save };
})();
