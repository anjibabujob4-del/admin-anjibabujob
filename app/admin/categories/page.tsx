import { createClient } from '@/lib/supabase/server'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q : ''

  let query = supabase
    .from('job_categories')
    .select('*')
    .order('name', { ascending: true })

  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  const { data: categories, error } = await query

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Categories</h1>
          <p className="text-slate-500 mt-1">Manage job categories and their icons</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Card className="border-slate-200/60 shadow-sm">
        <CardHeader className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50">
          <form className="flex max-w-sm relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              name="q"
              defaultValue={q}
              placeholder="Search categories..." 
              className="pl-9 h-9 bg-white"
            />
            <Button type="submit" variant="secondary" className="ml-2 h-9 hidden sm:flex">
              Search
            </Button>
          </form>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[300px] font-semibold text-slate-700">Category Name</TableHead>
                  <TableHead className="font-semibold text-slate-700 hidden sm:table-cell">Icon ID</TableHead>
                  <TableHead className="font-semibold text-slate-700 hidden md:table-cell">Date Created</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!categories || categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                      No categories found.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((cat) => (
                    <TableRow key={cat.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-900">
                        {cat.name}
                        <div className="text-xs text-slate-500 sm:hidden mt-1">Icon: {cat.icon || 'Default'}</div>
                      </TableCell>
                      <TableCell className="text-slate-500 hidden sm:table-cell">
                        {cat.icon || 'None'}
                      </TableCell>
                      <TableCell className="text-slate-500 hidden md:table-cell">
                        {new Date(cat.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-blue-600 h-8 w-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-600 h-8 w-8">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
