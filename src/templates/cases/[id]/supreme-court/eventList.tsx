import React, { useState } from 'react'
import { event as EventType } from '@/lib/types'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Bell, CalendarIcon, Edit2, Save, X, Clock } from 'lucide-react'
import { formatDate } from '@/lib/format'
import { updateEvent } from '@/data/event.service'
import { toast } from 'sonner'

interface EventListDialogProps {
    events: EventType[]
}

const EventListDialog: React.FC<EventListDialogProps> = ({ events }) => {
    const [open, setOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formState, setFormState] = useState<Record<string, any>>({})

    const startEdit = (evt: EventType) => {
        setEditingId(evt._id)
        setFormState({
            title: evt.title,
            notes: evt.notes || '',
            emails: evt.emails.join(', '),
            notification_date: new Date(evt.notification_date)
                .toISOString()
                .split('T')[0],
        })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormState(fs => ({ ...fs, [name]: value }))
    }

    const saveEdit = async (id: string) => {
        try {
            await updateEvent(id, {
                title: formState.title,
                notes: formState.notes,
                emails: formState.emails.split(',').map((s: string) => s.trim()),
                notification_date: new Date(formState.notification_date),
            })
            toast.success('تم تحديث الحدث بنجاح')
            setEditingId(null)
        } catch {
            toast.error('حدث خطأ أثناء التحديث')
        }
    }


    const timesLeft = (evt: EventType) => {
        const now = new Date()
        const notificationDate = new Date(evt.notification_date)
        const diffTime = notificationDate.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                    <Button variant="default" className='bg-transparent hover:bg-primary/10 rounded-full w-10 h-10'>
                        <div className="relative border-1  rounded-xl p-2">
                            <Bell className='h-4 w-4 text-primary' />
                {events.length > 0 ? (
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-white flex items-center justify-center">{events.length}</span>
                        ) : ''}
                        </div>
                    </Button>
            </DialogTrigger>

            <DialogContent className="max-w-3xl" dir="rtl">
                <DialogHeader>
                    <DialogTitle>جميع الإشعارات</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {events.map(evt => {

                        return (
                            <div key={evt._id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-center w-full gap-4">
                                    {/* Title */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-lg">العنوان: {evt.title}</span>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10">
                                        <CalendarIcon className="h-4 w-4 text-green-700" />
                                        <span className="text-xs text-green-700">
                                            {formatDate(evt.notification_date)}
                                        </span>
                                    </div>

                                    {/* Time Remaining */}
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10">
                                        <Clock className='h-4 w-4 text-yellow-700' />
                                        <span className="text-xs  text-yellow-700">
                                            الوقت المتبقي للإشعار: {timesLeft(evt)}
                                        </span>
                                    </div>
                                </div>

                                {editingId === evt._id ? (
                                    <div className="space-y-4 mt-4">
                                        <Input
                                            name="title"
                                            value={formState.title}
                                            onChange={handleChange}
                                            dir="rtl"
                                            className="text-right"
                                        />
                                        <Input
                                            type="date"
                                            name="notification_date"
                                            value={formState.notification_date}
                                            onChange={handleChange}
                                            dir="rtl"
                                        />
                                        <Textarea
                                            name="notes"
                                            value={formState.notes}
                                            onChange={handleChange}
                                            rows={3}
                                            dir="rtl"
                                        />
                                        <Input
                                            name="emails"
                                            value={formState.emails}
                                            onChange={handleChange}
                                            dir="rtl"
                                        />
                                        <div className="flex gap-2 justify-start">
                                            <Button
                                                onClick={() => saveEdit(evt._id)}
                                                className="flex items-center gap-2"
                                            >
                                                <Save className="h-4 w-4" />
                                                حفظ
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setEditingId(null)}
                                                className="flex items-center gap-2"
                                            >
                                                <X className="h-4 w-4" />
                                                إلغاء
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3 mt-4">

                                        {evt.notes && (
                                            <p className="text-gray-700 whitespace-pre-line">
                                                الملاحظات: {evt.notes}
                                            </p>
                                        )}
                                        <div>
                                            <p className="font-medium">المستلمون:</p>
                                            <div className=" gap-4 flex flex-wrap">

                                                {evt.emails.map(email => (
                                                    <Badge className='bg-primary/10 text-primary' key={email}>{email}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => startEdit(evt)}
                                            className="flex items-center gap-2"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                            تعديل
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default EventListDialog