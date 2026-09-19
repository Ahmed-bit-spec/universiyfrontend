/**
 * SocketSyncProvider
 *
 * ⚠️  IMPORTANT — placement in your tree:
 *
 * This provider uses useNavigate() internally (via useSocketSync).
 * useNavigate() requires being inside <BrowserRouter>.
 *
 * ✅ CORRECT:
 *   <QueryClientProvider>
 *     <BrowserRouter>
 *       <AuthProvider>
 *         <SocketSyncProvider>   ← inside BrowserRouter
 *           <Routes />
 *         </SocketSyncProvider>
 *       </AuthProvider>
 *     </BrowserRouter>
 *   </QueryClientProvider>
 *
 * ❌ WRONG (will crash):
 *   <QueryClientProvider>
 *     <SocketSyncProvider>       ← outside BrowserRouter
 *       <BrowserRouter>
 *         <Routes />
 *       </BrowserRouter>
 *     </SocketSyncProvider>
 *   </QueryClientProvider>
 */

import { useSocketSync } from "./useSocketSync";

export const SocketSyncProvider = ({ children }) => {
    useSocketSync();
    return children;
};

export default SocketSyncProvider;