import { useState } from 'react'
import AddPreLitigation from './add'
import { PreLitigation as PreLitigationType, event } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
import {
    CalendarIcon,
    FileTextIcon,
    UserIcon,
    SendIcon,
    InfoIcon,
    MapPinIcon,
    GavelIcon,
    ClipboardIcon,
    BellIcon,
    BellOffIcon,
    MessageSquareIcon,
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

import { formatDate } from "@/lib/format"

import EventList from './eventList'

function PreLitigation({ prelitigation, case_id, sender, resiver, onAdd, box_number, file_number, events }:
    { prelitigation: PreLitigationType[], case_id: string, sender: string, resiver: string, onAdd: () => void, box_number: string, file_number: string, events: event[] }) {

    const [selectedItem, setSelectedItem] = useState<PreLitigationType | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)


    //   const [actionFilter, setActionFilter] = useState('جميع الاجراءات')





    const handleCardClick = (item: PreLitigationType) => {
        setSelectedItem(item)
        setDialogOpen(true)
    }



    return (
        <div className="space-y-6" dir="rtl">
            <div className='flex justify-between items-center'>
                <div className="flex items-center gap-0.5">
                    <EventList events={events} />
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        الاعذارات
                    </h2>
                </div>
                <AddPreLitigation
                    onAdd={onAdd}
                    case_id={case_id}
                    sender={sender}
                    resiver={resiver}
                    box_number={box_number}
                    file_number={file_number}
                />
            </div>








            {prelitigation.length > 0 ? (
                <div className="space-y-4 grid grid-cols-1 md:grid-cols-1 gap-2" dir="rtl">
                    {prelitigation.map((item) => (
                        <Card
                            key={item._id}
                            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2"
                            onClick={() => handleCardClick(item)}
                        >
                            <CardHeader className="pb-4 flex flex-row justify-between items-start bg-muted/10">
                                <div>
                                    <CardTitle className="text-xl font-bold mb-2">
                                        نوع الإجراء: {item.type_of_action}
                                    </CardTitle>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <p className="text-sm text-muted-foreground">
                                        تاريخ الإرسال للمحامي: {formatDate(item.date_sent_to_lawyer)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">رقم الصندوق: {box_number} </p>
                                    <p className="text-xs text-muted-foreground">رقم الملف: {file_number} </p>
                                </div>
                            </CardHeader>

                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                                <div className="flex items-start gap-3 p-3 bg-muted/5 rounded-lg hover:bg-muted/10 transition-colors">
                                    <UserIcon className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">المرسل</p>
                                        <p className="font-medium">{item.sender}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-muted/5 rounded-lg hover:bg-muted/10 transition-colors">
                                    <SendIcon className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">المستلم</p>
                                        <p className="font-medium">{item.receiver}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-muted/5 rounded-lg hover:bg-muted/10 transition-colors">
                                    <MapPinIcon className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">العنوان</p>
                                        <p className="font-medium">{item.address}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-muted/5 rounded-lg hover:bg-muted/10 transition-colors">
                                    <GavelIcon className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">المحضر القضائي القائم بالتبليغ</p>
                                        <p className="font-medium">{item.judicial_officer}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-muted/5 rounded-lg hover:bg-muted/10 transition-colors md:col-span-2">
                                    <ClipboardIcon className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">ملاحظات</p>
                                        <p className="font-medium">{item.notes_or_taken_actions}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-muted/5 rounded-lg hover:bg-muted/10 transition-colors">
                                    <BellIcon className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground font-bold">تاريخ تسليم التحذير</p>
                                        <p className="font-medium">{formatDate(item.warning_delivery_date)}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-muted/5 rounded-lg hover:bg-muted/10 transition-colors">
                                    <BellOffIcon className="h-5 w-5 mt-1 text-red-500" />
                                    <div>
                                        <p className="text-sm text-muted-foreground font-bold">تاريخ انتهاء التحذير</p>
                                        <p className="font-medium">{formatDate(item.warning_expiration_date)}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-muted/5 rounded-lg hover:bg-muted/10 transition-colors md:col-span-2">
                                    <MessageSquareIcon className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">طريقة الرد</p>
                                        <p className="font-medium">{item.response_method}</p>
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
                        <FileTextIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground text-xl mb-4">لا توجد إجراءات ما قبل التقاضي</p>
                        <Button
                            variant="default"
                            size="lg"
                            className="mt-2 hover:scale-105 transition-transform"
                            onClick={() => { }}
                        >
                            <FileTextIcon className="h-5 w-5 ml-2" />
                            إضافة إجراء جديد
                        </Button>
                    </CardContent>
                </Card>
            )}


            {/* Detail Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                {selectedItem && (
                    <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl" dir="rtl">
                        <DialogHeader className="border-b pb-4">
                            <DialogTitle className="text-2xl font-bold">{selectedItem.type_of_action}</DialogTitle>
                            <DialogDescription className="flex items-center gap-4 mt-2">
                                {/* <Badge variant={getStateVariant(selectedItem.state)} className="text-sm px-3 py-1">
                  {selectedItem.state}
                </Badge> */}
                                <span className="text-sm text-muted-foreground">
                                    <span className="font-bold">رقم الصندوق:</span> {box_number}
                                    <br />
                                    <span className="font-bold">رقم الملف:</span> {file_number}
                                </span>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
                            {[
                                { icon: UserIcon, label: "المرسل", value: selectedItem.sender },
                                { icon: SendIcon, label: "المستلم", value: selectedItem.receiver },
                                { icon: CalendarIcon, label: "تاريخ الإرسال", value: formatDate(selectedItem.date_sent_to_lawyer) },
                                { icon: MapPinIcon, label: "العنوان", value: selectedItem.address },
                                { icon: GavelIcon, label: "المحضر القضائي القائم بالتبليغ", value: selectedItem.judicial_officer },
                                { icon: ClipboardIcon, label: "ملاحظات أو إجراءات", value: selectedItem.notes_or_taken_actions, fullWidth: true },
                                { icon: BellIcon, label: "تاريخ تسليم التحذير", value: formatDate(selectedItem.warning_delivery_date) },
                                { icon: BellOffIcon, label: "تاريخ انتهاء التحذير", value: formatDate(selectedItem.warning_expiration_date) },
                                { icon: MessageSquareIcon, label: "طريقة الرد", value: selectedItem.response_method, fullWidth: true }
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

                        <DialogFooter className="flex flex-row-reverse justify-start gap-2 border-t pt-4 ">
                            <Button onClick={() => setDialogOpen(false)} variant="outline">إغلاق</Button>
                            <Button variant="default">
                                <FileTextIcon className="h-4 w-4 ml-2 text-white" />
                                تعديل
                            </Button>
                            <Button variant="destructive">
                                <FileTextIcon className="h-4 w-4 ml-2 text-white" />
                                حذف
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
        </div>

    )
}

export default PreLitigation;
