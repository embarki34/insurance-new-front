"use client"
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { Pagination } from '@/lib/types'
interface PaginationProps {
    pagination: Pagination
}

const  pagination: React.FC<PaginationProps> = ({ pagination }) => {
    const [limit, setLimit] = useState(pagination.itemsPerPage)
    const [page, setPage] = useState(pagination.currentPage)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    

    useEffect(() => {
        setLimit(pagination.itemsPerPage);
        setPage(pagination.currentPage);
    }, [pagination]);   

    const handleLimitChange = (newLimit: string) => {
        setLimit(Number(newLimit))
        navigate(`/settings/juridique-notice-process-types?page=1&limit=${newLimit}`) // Reset to first page on limit change
    }

    const handlePageChange = async (newPage: number) => {
        if (newPage < 1 || newPage > pagination.totalPages) return;
        setIsLoading(true);
        setPage(newPage);
        navigate(`/settings/juridique-notice-process-types?page=${newPage}&limit=${limit}`);
        setIsLoading(false);
    }

    return (
        <div className="flex items-center gap-2  justify-between bg-transparent p-4">
            <div className="flex items-center ">
                <p className="text-sm text-muted-foreground">
                    {pagination.totalItems} {pagination.totalItems === 1 ? 'policy' : 'policies'} found
                </p>
            </div>
            <div className="flex items-center space-x-2">
                <select
                    className="border rounded-md p-1"
                    value={limit}
                    onChange={(e) => handleLimitChange(e.target.value)}
                >
                    {[10, 25, 50, 100].map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1 || isLoading}
                >
                    Previous
                </Button>
                <div className="flex items-center gap-1">
                    <div className="text-sm font-medium">Page</div>
                    <div className="text-sm font-medium">{pagination.currentPage}</div>
                    <div className="text-sm font-medium text-muted-foreground">of</div>
                    <div className="text-sm font-medium">{pagination.totalPages}</div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === pagination.totalPages || isLoading}
                >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Next
                </Button>
            </div>
        </div>
    )
}

export default pagination