import { Event } from '../../types';

interface TicketWalletProps {
  events: Event[];
  myTickets: string[];
  ticketDetails?: any[];
  handleRegister: (event: Event) => void;
  setCurrentTab: (tab: 'dashboard' | 'events' | 'tickets') => void;
  searchQuery: string;
}

export default function TicketWallet({
  events,
  ticketDetails = [],
  handleRegister,
  setCurrentTab,
  searchQuery
}: TicketWalletProps) {
  
  // Apply Search Filter to Ticket Wallet
  const filteredTicketDetails = ticketDetails.filter((ticketDetail: any) => {
    const eventId =
      ticketDetail.registration?.event?._id ||
      ticketDetail.registration?.event?.id ||
      ticketDetail.registration?.event;
    const event = events.find((e) => e.id === eventId);
    
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const titleMatch = event?.title?.toLowerCase().includes(query) || ticketDetail.registration?.event?.title?.toLowerCase().includes(query);
    const codeMatch = ticketDetail.ticketCode?.toLowerCase().includes(query);
    
    return titleMatch || codeMatch;
  });
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10 text-center md:text-left">
        <h3 className="font-headline-xl text-headline-xl uppercase mb-2">My Ticket Wallet</h3>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Show these tickets at the venue entry points. The administrative officers will validate the secure QR code.
        </p>
      </div>

      {filteredTicketDetails.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredTicketDetails.map((ticketDetail: any) => {
            const eventId =
              ticketDetail.registration?.event?._id ||
              ticketDetail.registration?.event?.id ||
              ticketDetail.registration?.event;
            const event = events.find((e) => e.id === eventId) || {
              title: ticketDetail.registration?.event?.title || 'Unknown Event',
              date: 'TBD',
              time: 'TBD',
              location: 'TBD'
            } as any;

            const qrCodeUrl = ticketDetail.qrCodeDataUri || ticketDetail.qrCode;
            const ticketCode = ticketDetail.ticketCode;

            return (
              <div key={ticketDetail._id || ticketCode} className="bg-surface border-4 border-on-background neo-shadow ticket-edge flex flex-col">
                <div className="p-6 border-b-2 border-dashed border-on-background flex justify-between items-center bg-[#dcd5fd] dark:bg-surface-container-high">
                  <span className="font-label-bold uppercase text-xs tracking-wider font-semibold text-slate-800 dark:text-slate-200">
                    CAMPUS VIP ENTRY PASS
                  </span>
                  <span className="bg-white dark:bg-background border-2 border-on-background px-2 py-0.5 font-bold text-xs">
                    FREE
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between gap-6">
                  <div>
                    <h4 className="font-headline-md text-xl font-bold uppercase mb-2">
                      {event.title}
                    </h4>
                    <div className="space-y-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      <p className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">calendar_month</span> {event.date} • {event.time}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">location_on</span> {event.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center border-t-2 border-on-background/10 pt-4 text-center">
                    <div className="w-36 h-36 border-4 border-on-background p-2.5 bg-white dark:bg-slate-100 mb-2 shadow-sm flex items-center justify-center">
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="Ticket QR Code" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-xs font-bold text-slate-400 uppercase text-center px-2">
                          QR loading...
                        </span>
                      )}
                    </div>
                    {ticketCode && (
                      <span className="font-label-bold text-xs uppercase tracking-widest text-[#1b6b4f] dark:text-[#a6f2cf]">
                        {ticketCode}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 block mt-1 uppercase font-semibold">
                      SCANNER SECURE CODE
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-on-background dark:bg-black text-white dark:text-slate-300 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-[#a6f2cf]">Verified Pass</span>
                  <button 
                    onClick={() => handleRegister(event)}
                    className="text-[#ffdad6] hover:text-red-400 font-bold text-xs uppercase underline"
                  >
                    Cancel RSVP
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center border-4 border-dashed border-on-background bg-surface p-8">
          <span className="material-symbols-outlined text-5xl mb-4 text-[#ba1a1a]">confirmation_number</span>
          <h3 className="font-headline-md text-xl font-bold uppercase mb-2">Your Wallet is Empty</h3>
          <p className="text-on-surface-variant text-sm mb-6">
            You have not registered for any events yet. Secure a free spot on the dashboard.
          </p>
          <button 
            onClick={() => setCurrentTab('dashboard')}
            className="bg-primary text-white border-4 border-on-background neo-shadow-sm px-6 py-2.5 font-label-bold uppercase text-xs hover-lift press-down"
          >
            Browse Events
          </button>
        </div>
      )}
    </div>
  );
}
