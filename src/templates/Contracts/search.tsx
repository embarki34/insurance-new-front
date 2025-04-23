"use client"
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function SearchComponent() {
  const [search, setSearch] = useState("")
  const navigate = useNavigate()
  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm)
    navigate(`/contracts?search=${searchTerm}`)
  }
  return (
    <div className="flex items-center gap-4 mt-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="بحث عن عقد..."
          className="pl-10"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
    </div>
  )
}

export default SearchComponent