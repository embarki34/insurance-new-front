import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    CalendarIcon,
    FileTextIcon,
    GavelIcon,
    ClipboardIcon,
    InfoIcon,
    Space,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import AddCourt from './add'
// import { Separator } from '@radix-ui/react-separator'
import EditCourt from './edite'
import EventList from './eventList'
import { court_dates, event } from '@/lib/types'
import { Separator } from '@/components/ui/separator'
function Courts({ courts, case_id, onAdd, onEdit, caseType, events }: { courts: any[], case_id: string, onAdd: () => void, onEdit: () => void, caseType: string, events: event[] }) {
    const [selectedCourt, setSelectedCourt] = useState<any | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    const handleCardClick = (court: any) => {
        setSelectedCourt(court)
        setDialogOpen(true)
    }

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' })
        } catch (e) {
            return dateString
        }
    }

    return (
        <div className="space-y-6" dir="rtl">

            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <EventList events={events} />
                    <GavelIcon className="h-5 w-5" />
                    قضايا علي  مستوى المحاكم
                </h2>
                {courts.length < 1 && <AddCourt case_id={case_id} onAdd={onAdd} onClose={() => setDialogOpen(false)} />}
            </div>

            {courts.length > 0 ? (
                <div className="space-y-4 " dir="rtl">
                    {courts.map((court) => (
                        <Card
                            key={court._id}
                            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2"
                            onClick={() => handleCardClick(court)}
                        >
                            <CardHeader className="pb-4 flex flex-row justify-between items-start bg-muted/10">
                                <div>
                                    <CardTitle className="text-xl font-bold mb-2">المحكمة: {court.court} </CardTitle>
                                    <Badge variant="default" className="text-sm px-3 py-1">
                                        {(court.court_type === "") ? caseType : court.court_type}
                                    </Badge>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <p className="text-sm text-muted-foreground">تاريخ الحكم: {formatDate(court.judgment_date)}</p>
                                    <p className="text-xs text-muted-foreground">رقم القضية: {court.court_case_number}</p>
                                </div>
                            </CardHeader>

                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                                {/* First Column - Court Information */}
                                <div className='flex flex-col gap-4'>
                                    <div className="flex items-start gap-3 p-3 bg-muted/5 rounded-lg hover:bg-muted/10 transition-colors">
                                        <FileTextIcon className="h-5 w-5 text-primary mt-1" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">رقم الفهرس</p>
                                            <p className="font-medium">{court.index_number}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 bg-muted/5 rounded-lg hover:bg-muted/10 transition-colors">
                                        <ClipboardIcon className="h-5 w-5 text-primary mt-1" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">ملخص الحكم</p>
                                            <p className="font-medium">{(court.judgment_summary === "") ? "لم يتم الحكم بعد" : court.judgment_summary}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 bg-muted/5 rounded-lg hover:bg-muted/10 transition-colors">
                                        <ClipboardIcon className="h-5 w-5 text-primary mt-1" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">ملاحظات</p>
                                            <p className="font-medium">{(court.notes === "") ? "لا يوجد ملاحظات" : court.notes}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Second Column - Dates Table */}
                                <div className="flex items-start gap-3 p-3 bg-muted/5 rounded-lg hover:bg-muted/10 transition-colors">
                                    <CalendarIcon className="h-5 w-5 text-primary mt-1" />
                                    <div className="w-full">
                                        <p className="text-sm text-muted-foreground mb-2">التاريخ</p>
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-right pb-2 font-medium">التاريخ</th>
                                                    <th className="text-right pb-2 font-medium">الملاحظات</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {court.court_dates?.map((date: court_dates, index: number) => (
                                                    <tr key={index} className="border-b last:border-0">
                                                        <td className="py-2 font-medium">{formatDate(date.date)}</td>
                                                        <td className="py-2 text-sm text-muted-foreground">{date.note}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="pt-0 flex justify-end gap-2 bg-muted/5 p-4">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="outline" size="sm" className="hover:bg-primary hover:text-white transition-colors">
                                                <InfoIcon className="h-4 w-4 ml-2" />
                                                عرض التفاصيل
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>عرض جميع التفاصيل</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="text-center py-16">
                        <GavelIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground text-xl mb-4">لا توجد قضايا علي المحاكم</p>
                    </CardContent>
                </Card>
            )}

            {/* Detail Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                {selectedCourt && (
                    <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl overflow-y-auto max-h-[90vh]" dir="rtl">
                        <DialogHeader className="border-b pb-4" dir="rtl">
                            <DialogTitle className="text-2xl font-bold flex justify-between" dir="rtl"> المحكمة:{" "}
                                {selectedCourt.court}
                                <Badge variant="default" className="text-sm px-3 py-1">
                                    {selectedCourt.court_type}
                                    {caseType}
                                </Badge>
                                {/* <Separator orientation="vertical" className='h-4' /> */}
                            </DialogTitle>
                            <DialogDescription className="flex items-center gap-4 mt-2" dir="rtl">

                                <Badge variant="default" className='text-sm px-3 py-1 bg-green-200 text-green-600'>
                                    رقم القضية: {selectedCourt.court_case_number}

                                </Badge>
                                <span className='text-sm text-muted-foreground'>
                                    |
                                </span>
                                <Badge variant="default" className='text-sm px-3 py-1 bg-primary/10 text-primary'>
                                    رقم الفهرس:{selectedCourt.index_number}
                                </Badge>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
                            {[
                                { icon: FileTextIcon, label: "رقم الفهرس", value: selectedCourt.index_number },
                                { icon: CalendarIcon, label: "تاريخ الحكم", value: formatDate(selectedCourt.judgment_date) },
                                { icon: ClipboardIcon, label: "ملخص الحكم", value: (selectedCourt.judgment_summary === "") ? "لم يتم الحكم بعد" : selectedCourt.judgment_summary, fullWidth: true },
                                { icon: ClipboardIcon, label: "ملاحظات", value: (selectedCourt.notes === "") ? "لا توجد ملاحظات" : selectedCourt.notes, fullWidth: true }
                            ].map((item, index) => (
                                <div key={index} className={`flex items-start gap-3 p-4 bg-muted/5 rounded-lg ${item.fullWidth ? 'md:col-span-1' : ''}`}>
                                    <item.icon className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                                        <p className="font-medium">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                            <Separator className='my-4' />
                            <div className="flex items-start gap-3 p-3 bg-muted/5 rounded-lg hover:bg-muted/10 transition-colors md:col-span-2">
                                <CalendarIcon className="h-5 w-5 text-primary mt-1" />
                                <div className="w-full">
                                    <p className="text-sm text-muted-foreground mb-2">التاريخ</p>
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-right pb-2 font-medium">التاريخ</th>
                                                <th className="text-right pb-2 font-medium">الملاحظات</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedCourt.court_dates?.map((date: court_dates, index: number) => (
                                                <tr key={index} className="border-b last:border-0">
                                                    <td className="py-2 font-medium">{formatDate(date.date)}</td>
                                                    <td className="py-2 text-sm text-muted-foreground">{date.note}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="flex flex-row-reverse justify-start gap-2 border-t pt-4">
                            <Button onClick={() => setDialogOpen(false)} variant="outline">إغلاق</Button>
                            <EditCourt
                                litigation={selectedCourt}
                                onEdit={() => {
                                    setDialogOpen(false);
                                    onEdit();
                                }}
                                onClose={() => setDialogOpen(false)}
                            />

                        </DialogFooter>
                    </DialogContent>

                )}
            </Dialog>
        </div>
    )
}

export default Courts;