import CustomerHeader from '@/components/customer/header'
import CustomerFooter from '@/components/customer/footer'

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <CustomerHeader />
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
      <CustomerFooter />
    </div>
  )
}
