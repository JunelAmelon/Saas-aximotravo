import Image from 'next/image';
import { MAINTENANCE_CONFIG } from '@/config/maintenance';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="max-w-4xl w-full px-4">
        <div className="text-center">
          <div className="relative w-full max-w-3xl mx-auto">
            <Image
              src="/maintenance.jpg"
              alt="Site en maintenance"
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg shadow-lg"
              priority
            />
          </div>
          <div className="mt-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Site en maintenance
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {MAINTENANCE_CONFIG.message}
            </p>
            <p className="text-md text-gray-500">
              Merci de votre patience, nous serons bientôt de retour !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
