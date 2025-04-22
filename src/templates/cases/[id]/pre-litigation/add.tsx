import React, { useEffect, useState } from 'react';
import { createPreLitigation } from '@/data/prelitigation.service';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Loader2, Send, Check, UserRound, FileText } from "lucide-react";
import { format, Locale, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { MultiSelector, MultiSelectorContent, MultiSelectorInput, MultiSelectorItem, MultiSelectorList, MultiSelectorTrigger } from '@/components/ui/multi-select';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { getParameters } from '@/data/parameters.service';
import { Parameter, PreLitigationInput, Value } from '@/lib/types';
import { Select, SelectValue, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { ar } from 'date-fns/locale/ar';
import { arDZ } from "date-fns/locale/ar-DZ";
import { formatDate } from "@/lib/format"





const AddPreLitigation = ({ onAdd, case_id, sender, resiver,box_number,file_number }: { onAdd: () => void, case_id: string, sender: string, resiver: string,box_number:string,file_number:string }) => {
    const [formData, setFormData] = useState<PreLitigationInput>({
        case_id: case_id,
        type_of_action: '',
        sender: sender,
        receiver: resiver,
        address: '',
        date_sent_to_lawyer: new Date(),
        judicial_officer: '',
        notes_or_taken_actions: '',
        warning_delivery_date: new Date(),
        warning_expiration_date: new Date(),
        response_method: '',
        createdby: '',
        event: {
            title: '',
            notes: '',
            case_lvl: -1,
            emails: [],
            notification_date: new Date(),
        }
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [open, setOpen] = useState(false);
    const [receive_notifications, setReceiveNotifications] = useState(false);
    const [activeTab, setActiveTab] = useState("basic");
    const [allParameters, setAllParameters] = useState<Parameter[]>([]);
    const [typeOfActionList, setTypeOfActionList] = useState<Value[]>([]);
    const [responseMethodList, setResponseMethodList] = useState<Value[]>([]);
    // const []


    // const formatToLocal = (date: Date, format: string, locale: Locale) => {
    //     return format(date, format, { locale });
    // }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDateChange = (date: Date, field: string) => {
        if (date) {
            if (field === 'event.notification_date') {
                setFormData(prev => ({
                    ...prev,
                    event: {
                        ...prev.event,
                        notification_date: date
                    }
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    [field]: date
                }));
            }
        }
    };

    const resetForm = () => {
        setFormData({
            case_id: case_id,
            type_of_action: '',
            sender: sender,
            receiver: resiver,
            address: '',
            date_sent_to_lawyer: new Date(),
            judicial_officer: '',
            notes_or_taken_actions: '',
            warning_delivery_date: new Date(),
            warning_expiration_date: new Date(),
            response_method: '',
            createdby: '',
            event: {
                title: '',
                notes: '',
                emails: [],
                case_lvl: -1,
                notification_date: new Date()
            }
        });
        setReceiveNotifications(false);
        setActiveTab("basic");
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate form
        const requiredFields = [
            'type_of_action', 'sender', 'receiver', 'address', 'judicial_officer', 'response_method'
        ];

        const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
        console.log(missingFields);

        if (missingFields.length > 0) {
            toast.error('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        // Validate notification fields if notifications are enabled
        if (receive_notifications) {
            if (!formData.event.title || !formData.event.notes || formData.event.emails.length === 0) {
                toast.error('يرجى ملء جميع حقول الإشعارات المطلوبة');
                setActiveTab("notifications");
                return;
            }
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            await createPreLitigation(formData as PreLitigationInput);
            toast.success('تم إضافة إجراء ما قبل التقاضي بنجاح');
            setSuccess(true);
            resetForm();
            onAdd();

            // Close dialog after successful submission
            setTimeout(() => {
                setOpen(false);
                setSuccess(false);
            }, 1500);

        } catch (err: any) {
            toast.error('فشل في إنشاء إجراء ما قبل التقاضي');
            setError(err instanceof Error ? err.message : 'فشل في إنشاء إجراء ما قبل التقاضي');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        let isMounted = true; // Track if the component is mounted

        const fetchParameters = async () => {
            if (isMounted) { // Only update state if the component is still mounted
                const parameters = await getParameters();
                console.log(parameters);
                // setAllParameters(parameters);

                const responseMethod = parameters.find(p => p.key === "نوع_تبليغ_الاعذار")?.values || [];
                const typeOfAction = parameters.find(p => p.key === "نوع_الوثيقة_أو_نوع_الاجراء")?.values || [];

                console.log(responseMethod);
                console.log(typeOfAction);

                setTypeOfActionList(typeOfAction);
                setResponseMethodList(responseMethod);
                console.log(typeOfActionList);
                console.log(responseMethodList);
            }
        };

        fetchParameters();

        return () => {
            isMounted = false; // Cleanup function to set isMounted to false
        };
    }, []);

    // Common styles for date picker buttons
    const dateButtonClass = "w-full justify-start text-right font-normal";

    // Sample email options for demonstration
    const emailOptions = [
        "omar.embarki@condor.com",
        "omar.embarki@condo.com",
        "legal@example.com",
        "notifications@lawfirm.com"
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogTrigger asChild>
                <Button variant="default" className="w-full md:w-60 gap-2">
                    <FileText className="w-4 h-4" />
                    إضافة إجراء ما قبل التقاضي
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] p-0 max-h-[90vh] overflow-y-auto" >
                <DialogHeader className="p-4 pb-2 bg-muted/50 sticky top-0 z-10" dir="rtl">
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        إضافة إجراء ما قبل التقاضي
                    </DialogTitle>

                        <DialogDescription className='text-sm'>
                            <span>رقم الصندوق: {box_number}</span>
                            <br />
                            <span>رقم الملف: {file_number}</span>
                        </DialogDescription>

                </DialogHeader>

                {error && (
                    <Alert variant="destructive" className="mx-4 mt-2">
                        <AlertTitle>خطأ</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="mx-4 mt-2 border-green-500 bg-green-50 text-green-700">
                        <Check className="h-4 w-4" />
                        <AlertTitle>نجاح</AlertTitle>
                        <AlertDescription>تمت إضافة إجراء ما قبل التقاضي بنجاح!</AlertDescription>
                    </Alert>
                )}

                <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="px-4">
                    <TabsList className="grid w-full grid-cols-2 ">
                        <TabsTrigger value="notifications" disabled={isSubmitting}>الإشعارات</TabsTrigger>
                        <TabsTrigger value="basic">البيانات الأساسية</TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleSubmit} className="space-y-3" dir="rtl">
                        <TabsContent value="basic" className="space-y-3 mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3" dir="rtl">
                                <div className="space-y-2 border-1 border-gray-200 rounded-md p-2" dir="rtl">
                                    <h3 className="font-medium text-sm">معلومات الإجراء</h3>
                                    <div className="grid grid-cols-1 gap-2" dir="rtl">
                                        {/* <div>
                                            <Label htmlFor="case_id" className="text-xs">رقم القضية*</Label>
                                            <Input
                                                id="case_id"
                                                name="case_id"
                                                value={formData.case_id}
                                                disabled
                                                className="mt-1 h-8 bg-muted/50"
                                            />
                                        </div> */}




























                                        <div dir="rtl">
                                            <Label htmlFor="type_of_action" className="text-xs ">نوع الإجراء*</Label>
                                            <Select value={formData.type_of_action} onValueChange={(v) => handleInputChange("type_of_action", v)} dir="rtl">
                                                <SelectTrigger className="transition-all focus-visible:ring-primary w-full">
                                                    <SelectValue placeholder="اختر نوع الإجراء" />
                                                </SelectTrigger>


                                                <SelectContent>
                                                    {typeOfActionList.map((type) => (
                                                        <SelectItem key={type.key} value={type.key} dir="rtl">
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {/* <div>
                                            <Label htmlFor="state" className="text-xs">الحالة*</Label>
                                            <Input
                                                id="state"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 h-8"
                                                placeholder="أدخل الحالة"
                                            />
                                        </div> */}

                                        <div dir="rtl">
                                            <Label htmlFor="response_method" className="text-xs">طريقة التبليغ*</Label>
                                            <Select value={formData.response_method} onValueChange={(v) => handleInputChange("response_method", v)} dir="rtl">
                                                <SelectTrigger className="transition-all focus-visible:ring-primary w-full">
                                                    <SelectValue placeholder="اختر طريقة التبليغ" />
                                                </SelectTrigger>


                                                <SelectContent>
                                                    {responseMethodList.map((type) => (
                                                        <SelectItem key={type.key} value={type.key} dir="rtl">
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>








































                                <div className="space-y-2 border-1 border-gray-200 rounded-md p-2">
                                    <h3 className="font-medium text-sm">المعلومات القانونية</h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {/* <div>
                                            <Label htmlFor="sender" className="text-xs">المرسل*</Label>
                                            <Input
                                                id="sender"
                                                name="sender"
                                                value={formData.sender}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 h-8"
                                                placeholder="أدخل اسم المرسل"
                                            />
                                        </div>
                                        
                                        <div>
                                            <Label htmlFor="receiver" className="text-xs">المستلم*</Label>
                                            <Input
                                                id="receiver"
                                                name="receiver"
                                                value={formData.receiver}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 h-8"
                                                placeholder="أدخل اسم المستلم"
                                            />
                                        </div> */}

                                        <div>
                                            <Label htmlFor="judicial_officer" className="text-xs">المحضر القضائي*</Label>
                                            <Input
                                                id="judicial_officer"
                                                name="judicial_officer"
                                                value={formData.judicial_officer}
                                                onChange={(e) => handleInputChange("judicial_officer", e.target.value)}
                                                required
                                                className="mt-1 h-8"
                                                placeholder="المحضر القضائي"
                                            />
                                        </div>

                                        {/* add the wilaya and the daira  as one input */}

                                        <div>
                                            <Label htmlFor="address" className="text-xs">العنوان*</Label>
                                            <Input
                                                id="address"
                                                name="address"
                                                value={formData.address}
                                                onChange={(e) => handleInputChange("address", e.target.value)}
                                                required
                                                className="mt-1 h-8"
                                                placeholder="أدخل العنوان"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 border-1 border-gray-200 rounded-md p-2">

                                <h3 className="font-medium text-sm">التواريخ المهمة</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* <div className="space-y-1">
                                        <Label className="text-xs">تاريخ الإرسال إلى المحامي*</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={cn(
                                                        dateButtonClass,
                                                        "h-8",
                                                        !formData.date_sent_to_lawyer && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="ml-2 h-4 w-4" />
                                                    {formData.date_sent_to_lawyer ? format(formData.date_sent_to_lawyer, "PPP") : "اختر تاريخ"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={formData.date_sent_to_lawyer}
                                                    onSelect={(date) => handleDateChange(date as Date, 'date_sent_to_lawyer')}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div> */}

                                    <div className="space-y-1">
                                        <Label className="text-xs">تاريخ تسليم التحذير*</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={cn(
                                                        dateButtonClass,
                                                        "h-8",
                                                        !formData.warning_delivery_date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="ml-2 h-4 w-4" />
                                                    {formData.warning_delivery_date ? formatDate(formData.warning_delivery_date) : "اختر تاريخ"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={formData.warning_delivery_date}
                                                    onSelect={(date) => handleDateChange(date as Date, 'warning_delivery_date')}
                                                    initialFocus
                                                    locale={arDZ}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs">تاريخ انتهاء التحذير*</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={cn(
                                                        dateButtonClass,
                                                        "h-8",
                                                        !formData.warning_expiration_date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="ml-2 h-4 w-4" />
                                                    {formData.warning_expiration_date ? formatDate(formData.warning_expiration_date) : "اختر تاريخ"}
                                                    
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={formData.warning_expiration_date}
                                                    onSelect={(date) => handleDateChange(date as Date, 'warning_expiration_date')}
                                                    initialFocus
                                                    locale={arDZ}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 border-1 border-gray-200 rounded-md p-2">
                                <h3 className="font-medium text-sm">ملاحظات</h3>
                                <div>
                                    <Label htmlFor="notes_or_taken_actions" className="text-xs">ملاحظات أو إجراءات تم اتخاذها</Label>
                                    <Textarea
                                        id="notes_or_taken_actions"
                                        name="notes_or_taken_actions"
                                        value={formData.notes_or_taken_actions}
                                        onChange={(e) => handleInputChange("notes_or_taken_actions", e.target.value)}
                                        rows={2}
                                        className="mt-1"
                                        placeholder="أدخل الملاحظات أو الإجراءات التي تم اتخاذها (اختياري)"
                                    />
                                </div>
                            </div>



                            <div className="flex justify-between mt-3 sticky bottom-0 bg-white py-2 border-t">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)} size="sm">
                                    إلغاء
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setActiveTab("notifications")}
                                    disabled={isSubmitting}
                                    size="sm"
                                >
                                    التالي
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="notifications" className="space-y-3 mt-0">
                            <div className="flex items-center space-x-2 mt-3">
                                <Checkbox
                                    id="receive_notifications"
                                    checked={receive_notifications}
                                    onCheckedChange={(checked) => {
                                        setReceiveNotifications(checked === true);
                                        if (checked === true) {
                                            setTimeout(() => setActiveTab("notifications"), 100);
                                        }
                                    }}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="receive_notifications" className="text-sm font-medium mr-2 cursor-pointer">
                                    تفعيل الإشعارات عبر البريد الإلكتروني
                                </Label>
                            </div>
                            <div className={`space-y-3 ${!receive_notifications ? "opacity-50" : ""}`}>
                                <h3 className="font-medium text-sm">تفاصيل الإشعارات</h3>
                                <p className="text-xs text-muted-foreground">
                                    سيتم إرسال الإشعارات إلى البريد الإلكتروني المحدد في التاريخ المحدد
                                </p>

                                <div className="space-y-2">
                                    <Label htmlFor="event_title" className="text-xs">عنوان الإشعار*</Label>
                                    <Input
                                        id="event_title"
                                        name="event_title"
                                        value={formData.event.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, event: { ...prev.event, title: e.target.value } }))}
                                        required={receive_notifications}
                                        disabled={!receive_notifications}
                                        placeholder="أدخل عنوان الإشعار"
                                        className="h-8"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="event_notes" className="text-xs">محتوى الإشعار*</Label>
                                    <Textarea
                                        id="event_notes"
                                        name="event_notes"
                                        value={formData.event.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, event: { ...prev.event, notes: e.target.value } }))}
                                        required={receive_notifications}
                                        disabled={!receive_notifications}
                                        rows={2}
                                        placeholder="أدخل محتوى الإشعار"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="emails" className="text-xs">البريد الإلكتروني*</Label>
                                    <MultiSelector
                                        values={formData.event.emails}
                                        onValuesChange={(emails: string[]) => setFormData(prev => ({ ...prev, event: { ...prev.event, emails: emails as never[] } }))}
                                    >
                                        <MultiSelectorTrigger className="w-full h-8">
                                            <MultiSelectorInput placeholder="أدخل البريد الإلكتروني أو اختر من القائمة..." />
                                        </MultiSelectorTrigger>
                                        <MultiSelectorContent className="w-full">
                                            <MultiSelectorList>
                                                {emailOptions.map((email) => (
                                                    <MultiSelectorItem key={email} value={email}>
                                                        <UserRound className="w-4 h-4 ml-2 text-muted-foreground" />
                                                        {email}
                                                    </MultiSelectorItem>
                                                ))}
                                            </MultiSelectorList>
                                        </MultiSelectorContent>
                                    </MultiSelector>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs">تاريخ الإشعار*</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={cn(
                                                    dateButtonClass,
                                                    "h-8",
                                                    !formData.event.notification_date && "text-muted-foreground"
                                                )}
                                                disabled={!receive_notifications}
                                                locale={ar}
                                            >
                                                <CalendarIcon className="ml-2 h-4 w-4" />
                                                {formData.event.notification_date ? formatDate(formData.event.notification_date as Date) : "اختر تاريخ"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={formData.event.notification_date}
                                                onSelect={(date) => handleDateChange(date as Date, 'event.notification_date')}
                                                initialFocus
                                                locale={arDZ}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                            </div>

                            <div className="flex justify-between mt-3 sticky bottom-0 bg-white py-2 border-t">
                                <Button
                                    type="button"
                                    onClick={() => setActiveTab("basic")}
                                    variant="outline"
                                    disabled={isSubmitting}
                                    size="sm"
                                >
                                    السابق
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="gap-2"
                                    size="sm"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            جاري الإرسال...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            إضافة إجراء ما قبل التقاضي
                                        </>
                                    )}
                                </Button>
                            </div>
                        </TabsContent>
                    </form>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default AddPreLitigation;