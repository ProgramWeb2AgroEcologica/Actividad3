import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function startTourGuide() {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    nextBtnText: 'Siguiente →',
    prevBtnText: '← Anterior',
    doneBtnText: '¡Comenzar!',
    popoverClass: 'driverjs-theme',
    steps: [
      {
        element: '#tour-brand',
        popover: {
          title: 'EcoFeria Santa Cruz',
          description: 'Iniciativa socioformativa de cero intermediarios: conecta a productores agroecológicos con consumidores urbanos para evitar el 28% de pérdidas post-cosecha.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-impact-banner',
        popover: {
          title: 'Presupuesto y Sostenibilidad',
          description: 'Esta aplicación cumple con el presupuesto de rendimiento web (≤ 500 KB, Lighthouse ≥ 90, WCAG 2.1 AA) para operar en redes rurales 4G y H+.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#tour-filters',
        popover: {
          title: 'Filtro Territorial y Categorías',
          description: 'Filtra hortalizas, frutas y artesanales por su municipio de cultivo (Samaipata, El Torno, Porongo, Vallegrande).',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#tour-products-grid',
        popover: {
          title: 'Catálogo Semanal de Cosechas',
          description: 'Precios justos fijados por los mismos agricultores en Bolivianos (Bs), con detalle de parcela, stock disponible y unidad de medida.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#tour-cart-btn',
        popover: {
          title: 'Canasta de Reserva',
          description: 'Haz clic aquí para revisar tus cosechas seleccionadas y pasar al formulario de reserva validado para retiro en feria.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '#nav-producer',
        popover: {
          title: 'Panel del Productor Agroecológico',
          description: 'Los agricultores gestionan sus cosechas en tiempo real: publicar productos, modificar precios y actualizar el estado de los pedidos.',
          side: 'bottom',
          align: 'center'
        }
      }
    ]
  });

  driverObj.drive();
}
