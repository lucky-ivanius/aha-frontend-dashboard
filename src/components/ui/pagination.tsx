import { cn } from "@/lib/utils"
import { Button } from "./button"

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className,
  ...props
}: PaginationProps) {
  const getPaginationItems = () => {
    const items = []
    
    // Always show first page
    items.push(
      <Button
        key="first"
        variant={currentPage === 1 ? "default" : "outline"}
        size="sm"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        1
      </Button>
    )
    
    // Show dots if needed
    if (currentPage > 3) {
      items.push(
        <span key="dots-1" className="px-2">
          ...
        </span>
      )
    }
    
    // Show current page and neighbors
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue // Skip first and last page as they're always shown
      items.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(i)}
        >
          {i}
        </Button>
      )
    }
    
    // Show dots if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <span key="dots-2" className="px-2">
          ...
        </span>
      )
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <Button
          key="last"
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          {totalPages}
        </Button>
      )
    }
    
    return items
  }

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)} {...props}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Previous
      </Button>
      
      <div className="flex items-center">
        {getPaginationItems()}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
      </Button>
    </div>
  )
}