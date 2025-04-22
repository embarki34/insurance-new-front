import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    CalendarIcon,
    FileTextIcon,
    GavelIcon,
    ClipboardIcon,
    InfoIcon,
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
import { Separator } from '@/components/ui/separator'
import AddJudicialCouncil from './add'
import EventList from './eventList'
import { event } from '@/lib/types'
 

function JudicialCouncils({ judicialCouncils, onAdd, case_id, caseType, events }: { judicialCouncils: any[], onAdd: () => void, case_id: string, caseType: string, events: event[] }) {
    const [selectedCouncil, setSelectedCouncil] = useState<any | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    const handleCardClick = (council: any) => {
        setSelectedCouncil(council)
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
            {/* <div className="flex items-center gap-0.5"> */}
               
            {/* </div> */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                <EventList events={events} />
                    <GavelIcon className="h-5 w-5" />
                    قضايا علي مستوى المجالس القضائية
                </h2>
                {judicialCouncils.length < 1 && <AddJudicialCouncil case_id={case_id} onAdd={onAdd} onClose={() => setDialogOpen(false)} />}
            </div>

            {judicialCouncils.length > 0 ? (
                <div className="space-y-4" dir="rtl">
                    {judicialCouncils.map((council) => (
                        <Card
                            key={council._id}
                            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2"
                            onClick={() => handleCardClick(council)}
                        >
                            <CardHeader className="pb-4 flex flex-row justify-between items-start bg-muted/10">
                                <div>
                                    <CardTitle className="text-xl font-bold mb-2">المحكمة: {council.court}</CardTitle>
                                    <Badge variant="default" className="text-sm px-3 py-1">
                                        {(council.court_type) ? council.court_type : caseType}
                                    </Badge>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <p className="text-sm text-muted-foreground">تاريخ الحكم: {formatDate(council.judgment_date)}</p>
                                    <p className="text-xs text-muted-foreground">رقم القضية: {council.court_case_number}</p>
                                </div>
                            </CardHeader>

                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                                <div className="flex items-start gap-3 p-3 bg-muted/5 rounded-lg hover:bg-muted/10 transition-colors">
                                    <FileTextIcon className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">رقم الفهرس</p>
                                        <p className="font-medium">{council.index_number}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-muted/5 rounded-lg hover:bg-muted/10 transition-colors md:col-span-2">
                                    <ClipboardIcon className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">ملخص الحكم</p>
                                        <p className="font-medium">{council.judgment_summary}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-muted/5 rounded-lg hover:bg-muted/10 transition-colors md:col-span-2">
                                    <ClipboardIcon className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">ملاحظات</p>
                                        <p className="font-medium">{council.notes}</p>
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
                        <p className="text-muted-foreground text-xl mb-4">لا توجد قضايا علي المجالس القضائية</p>
                    </CardContent>
                </Card>
            )}

            {/* Detail Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                {selectedCouncil && (
                    <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl" dir="rtl">
                        <DialogHeader className="border-b pb-4">
                            <DialogTitle className="text-2xl font-bold flex justify-between">
                                المحكمة: {selectedCouncil.court}
                                <Badge variant="default" className="text-sm px-3 py-1">
                                    {(selectedCouncil.court_type) ? selectedCouncil.court_type : caseType}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription className="flex items-center gap-4 mt-2">
                                <Badge variant="default" className='text-sm px-3 py-1 bg-green-200 text-green-600'>
                                    رقم القضية: {selectedCouncil.court_case_number}
                                </Badge>
                                <span className='text-sm text-muted-foreground'>|</span>
                                <Badge variant="default" className='text-sm px-3 py-1 bg-primary/10 text-primary'>
                                    رقم الفهرس: {selectedCouncil.index_number}
                                </Badge>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
                            {[
                                { icon: FileTextIcon, label: "رقم الفهرس", value: selectedCouncil.index_number },
                                { icon: CalendarIcon, label: "تاريخ الحكم", value: formatDate(selectedCouncil.judgment_date) },
                                { icon: ClipboardIcon, label: "ملخص الحكم", value: selectedCouncil.judgment_summary, fullWidth: true },
                                { icon: ClipboardIcon, label: "ملاحظات", value: selectedCouncil.notes, fullWidth: true }
                            ].map((item, index) => (
                                <div key={index} className={`flex items-start gap-3 p-4 bg-muted/5 rounded-lg ${item.fullWidth ? 'md:col-span-2' : ''}`}>
                                    <item.icon className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                                        <p className="font-medium">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <DialogFooter className="flex flex-row-reverse justify-start gap-2 border-t pt-4">
                            <Button onClick={() => setDialogOpen(false)} variant="outline">إغلاق</Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    )
}

export default JudicialCouncils;