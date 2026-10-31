import React, { useState, useEffect } from 'react';
import { PaymentCard } from './types/paymentCard';
import { 
  fetchCards, 
  saveCard, 
  deleteCard, 
  duplicateCard,
  getCardPublicUrl
} from './services/apiService';
import { TEMPLATES_CATALOG, INITIAL_DEMO_CARD, TemplateDefinition } from './services/templateCatalog';
import { Header } from './components/common/Header';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { Dashboard } from './components/admin/Dashboard';
import { EditorLayout } from './components/editor/EditorLayout';
import { TemplatesCatalogView } from './components/catalog/TemplatesCatalogView';
import { HostingerGuideView } from './components/hostinger/HostingerGuideView';
import { PublicCardView } from './components/public/PublicCardView';

export default function App() {
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [activeCard, setActiveCard] = useState<PaymentCard | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor' | 'templates' | 'hostinger'>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [publicCardSlug, setPublicCardSlug] = useState<string | null>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cardParam = urlParams.get('card');
    if (cardParam) return cardParam;
    const match = window.location.pathname.match(/\/(?:t|pagos)\/([a-zA-Z0-9_-]+)/);
    return match?.[1] || null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Registro del Service Worker para PWA y soporte offline
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
        updateViaCache: 'none'
      }).then((registration) => {
        // Solicitar la versión más reciente del Service Worker en cada visita.
        return registration.update();
      }).catch((err) => {
        console.warn('Service worker registration/update failed:', err);
      });
    }
  }, []);

  // Detección de ruta pública (?card=slug o /t/slug o /pagos/slug)
  useEffect(() => {
    const detectPublicRoute = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const cardParam = urlParams.get('card');
      if (cardParam) {
        setPublicCardSlug(cardParam);
        return;
      }

      // Chequeo de pathname (/t/nombre-negocio o /pagos/nombre-negocio)
      const path = window.location.pathname;
      const tMatch = path.match(/\/(?:t|pagos)\/([a-zA-Z0-9_-]+)/);
      if (tMatch && tMatch[1]) {
        setPublicCardSlug(tMatch[1]);
        return;
      }

      setPublicCardSlug(null);
    };

    detectPublicRoute();
    window.addEventListener('popstate', detectPublicRoute);
    return () => window.removeEventListener('popstate', detectPublicRoute);
  }, []);

  // Carga inicial de tarjetas
  useEffect(() => {
    const initCards = async () => {
      setLoading(true);
      try {
        const data = await fetchCards();
        setCards(data);
        if (data.length > 0 && !activeCard) {
          setActiveCard(data[0]);
        }
      } catch (err) {
        console.error('Error inicializando tarjetas:', err);
      } finally {
        setLoading(false);
      }
    };

    initCards();
  }, []);

  // Helper para notificaciones Toast
  const addToast = (title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, title, description, type };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Crear nueva tarjeta desde cero o con plantilla específica
  const handleCreateNewCard = (template?: TemplateDefinition) => {
    const tmpl = template || TEMPLATES_CATALOG[0];
    const uniqueId = `card_${Date.now()}`;
    const defaultSlug = `negocio-${Math.random().toString(36).substring(2, 6)}`;

    const newCard: PaymentCard = {
      id: uniqueId,
      slug: defaultSlug,
      businessName: 'Mi Negocio Comercial',
      tagline: 'Transferencias Bancarias SPEI & Métodos de Pago',
      category: tmpl.category,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      logoShape: 'rounded',
      logoSize: 'md',
      logoAlignment: 'center',
      templateId: tmpl.id,
      theme: { ...tmpl.defaultTheme },
      banking: {
        enabled: true,
        sectionTitle: 'Transferencias Bancarias (SPEI)',
        accounts: [
          {
            id: `acc_${Date.now()}`,
            accountLabel: 'Cuenta Principal',
            beneficiary: 'Nombre o Razón Social',
            bankName: 'BBVA México',
            clabe: '',
            accountNumber: '',
            cardNumber: '',
            accountType: 'Cheques / Débito',
            reference: 'No. de Pedido',
            concept: 'Pago Servicio',
            currency: 'MXN',
            instructions: 'Envía tu comprobante de pago para validar tu orden.',
            customFields: [],
            visibleFields: {
              beneficiary: true,
              bankName: true,
              clabe: true,
              accountNumber: true,
              cardNumber: false,
              accountType: true,
              reference: true,
              concept: true,
              currency: true,
              instructions: true
            },
            shareInWhatsApp: true
          }
        ]
      },
      wifi: { enabled:false, ssid:'', password:'' },
      paypal: {
        enabled: false,
        sectionTitle: 'Pago con Tarjeta o Saldo PayPal',
        payUrl: '',
        businessName: '',
        description: '',
        suggestedAmount: '',
        currency: 'MXN',
        buttonText: 'Pagar con PayPal',
        instructions: ''
      },
      googleReview: {
        enabled: false,
        sectionTitle: '¿Disfrutaste tu experiencia?',
        reviewUrl: '',
        buttonText: 'Califícanos en Google ★★★★★',
        message: 'Tu opinión nos ayuda a seguir brindándote el mejor servicio.'
      },
      whatsapp: {
        enabled: true,
        phoneNumber: '',
        shareCardMessage: 'Hola, te comparto nuestra tarjeta digital oficial de pago:',
        shareBankMessage: 'Te comparto nuestros datos para transferencia:',
        shareAllMessage: 'Aquí tienes todos los métodos de pago disponibles:',
        promptText: 'Confirmar pago por WhatsApp'
      },
      qrCode: {
        enabled: true,
        includeLogo: true,
        size: 260,
        fgColor: '#0f172a',
        bgColor: '#ffffff'
      },
      publicNotes: 'Datos oficiales verificados directamente por el establecimiento.'
    };

    setActiveCard(newCard);
    setCards(prev => [newCard, ...prev]);
    setCurrentView('editor');
    addToast('Nueva tarjeta creada', 'Personaliza los datos bancarios y diseño en el editor.', 'success');
  };

  // Guardar tarjeta
  const handleSaveCard = async (cardToSave: PaymentCard, isPublish: boolean) => {
    try {
      const result = await saveCard(cardToSave);
      if (result.success) {
        // Actualizar lista local
        setCards(prev => {
          const idx = prev.findIndex(c => c.id === result.card.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = result.card;
            return next;
          }
          return [result.card, ...prev];
        });
        setActiveCard(result.card);

        if (isPublish) {
          addToast(
            '¡Tarjeta publicada con éxito!',
            `Tu enlace público activo es: ${getCardPublicUrl(result.card.slug)}`,
            'success'
          );
        } else {
          addToast('Borrador guardado', 'Los cambios se han guardado de forma persistente.', 'success');
        }
      }
    } catch (e: any) {
      addToast('Error al guardar', e.message || 'No se pudo guardar la tarjeta', 'error');
    }
  };

  // Duplicar tarjeta
  const handleDuplicateCard = async (id: string) => {
    try {
      const duplicated = await duplicateCard(id);
      setCards(prev => [duplicated, ...prev]);
      setActiveCard(duplicated);
      setCurrentView('editor');
      addToast('Tarjeta duplicada', `Se creó una copia con el slug: ${duplicated.slug}`, 'success');
    } catch (e: any) {
      addToast('Error al duplicar', e.message, 'error');
    }
  };

  // Eliminar tarjeta
  const handleDeleteCard = async (id: string) => {
    try {
      await deleteCard(id);
      setCards(prev => prev.filter(c => c.id !== id));
      if (activeCard?.id === id) {
        setActiveCard(cards.find(c => c.id !== id) || null);
        setCurrentView('dashboard');
      }
      addToast('Tarjeta eliminada', 'La tarjeta ha sido removida del sistema.', 'info');
    } catch (e: any) {
      addToast('Error al eliminar', e.message, 'error');
    }
  };

  // Alternar publicación
  const handleTogglePublish = async (card: PaymentCard) => {
    const nextStatus = card.status === 'published' ? 'draft' : 'published';
    const updated: PaymentCard = {
      ...card,
      status: nextStatus,
      publishedAt: nextStatus === 'published' ? (card.publishedAt || new Date().toISOString()) : undefined
    };
    await handleSaveCard(updated, nextStatus === 'published');
  };

  // 1. SI LA RUTA ES PÚBLICA, MOSTRAR EXCLUSIVAMENTE LA TARJETA PÚBLICA
  if (publicCardSlug) {
    return (
      <PublicCardView
        slug={publicCardSlug}
        onNotify={addToast}
      />
    );
  }

  // 2. VISTA DE ADMINISTRACIÓN Y EDITOR (PANEL COMERCIAL)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Barra de Navegación Principal */}
      <Header
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onNewCard={() => handleCreateNewCard()}
        isEditing={currentView === 'editor'}
      />

      {/* Contenido Principal de la Vista Activa */}
      <main className="flex-1">
        {currentView === 'dashboard' && (
          <Dashboard
            cards={cards}
            onSelectCard={(c) => {
              setActiveCard(c);
              setCurrentView('editor');
            }}
            onNewCard={() => handleCreateNewCard()}
            onDuplicateCard={handleDuplicateCard}
            onDeleteCard={handleDeleteCard}
            onTogglePublish={handleTogglePublish}
            onNotify={addToast}
          />
        )}

        {currentView === 'editor' && (
          activeCard ? (
            <EditorLayout
              card={activeCard}
              allCards={cards}
              onChange={(updated) => setActiveCard(updated)}
              onSave={handleSaveCard}
              onBack={() => setCurrentView('dashboard')}
              onDelete={handleDeleteCard}
              onNotify={addToast}
            />
          ) : (
            <div className="max-w-md mx-auto p-12 text-center text-slate-400">
              <p className="mb-4">No hay ninguna tarjeta seleccionada para editar.</p>
              <button
                onClick={() => handleCreateNewCard()}
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
              >
                Crear Nueva Tarjeta
              </button>
            </div>
          )
        )}

        {currentView === 'templates' && (
          <TemplatesCatalogView
            onSelectTemplateToCreate={(template) => handleCreateNewCard(template)}
            onNotify={addToast}
          />
        )}

        {currentView === 'hostinger' && (
          <HostingerGuideView onNotify={addToast} />
        )}
      </main>

      {/* Pie de Página Administrativo Sutil */}
      <footer className="py-6 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-medium text-slate-400">
            LAV Digital Pagos • Tarjetas Digitales de Pago para Negocios
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Compatible con Hostinger cPanel / hPanel</span>
            <span>•</span>
            <span>SPEI & PayPal</span>
          </div>
        </div>
      </footer>

      {/* Notificaciones Flotantes Toast */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
