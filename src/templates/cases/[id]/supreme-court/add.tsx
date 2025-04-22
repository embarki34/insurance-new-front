import React, { useState, useEffect } from 'react';
import { createJudicialCouncil } from '@/data/JudicialCouncils.service';
import { judicialCouncilInput } from '@/lib/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Briefcase, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { AutoComplete, type Option } from "@/components/ui/autocomplete";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from 'sonner';
import { getParameters } from '@/data/parameters.service';
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const AddJudicialCouncil: React.FC<{ case_id: string, onAdd: () => void, onClose: () => void }> = ({ case_id, onAdd, onClose }) => {
    const [formData, setFormData] = useState<judicialCouncilInput>({
        // _id: '',
        case_id: case_id,
        court: '',
        court_type: '',
        litigation_lvl: 2,
        index_number: '',
        court_case_number: '',
        judgment_date: new Date(),
        judgment_summary: '',
        notes: '',
        hearing_date: null,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [open, setOpen] = useState(false);

    const [inCourt, setInCourt] = useState(true);
    const [hasJudgment, setHasJudgment] = useState(false);
    const [courts, setCourts] = useState<Option[]>([]);
    const [selectedCourt, setSelectedCourt] = useState<Option | undefined>();
    const [activeTab, setActiveTab] = useState(0);
    // const [didNotsendToLawyer, setDidNotsendToLawyer] = useState(false);

    useEffect(() => {
        const fetchParameters = async () => {
            try {
                const parameters = await getParameters();
                const courtList = parameters.find(p => p.key === "المحكمة_العليا")?.values || [];
                // Transform to Option format for AutoComplete
                const courtOptions = courtList.map(court => ({
                    value: court.key,
                    label: court.label
                }));
                setCourts(courtOptions);
            } catch (error) {
                console.error("Error fetching parameters:", error);
            }
        };

        fetchParameters();
    }, []);

    // Set selected court when form data changes or on initial load
    useEffect(() => {
        if (formData.court && courts.length > 0) {
            const matchingCourt = courts.find(court => court.label === formData.court);
            if (matchingCourt) {
                setSelectedCourt(matchingCourt);
            }
        }
    }, [formData.court, courts]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDateChange = (date: Date | undefined, field: keyof judicialCouncilInput) => {
        if (date) {
            setFormData(prev => ({
                ...prev,
                [field]: date
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            await createJudicialCouncil(formData);
            toast.success('تم إضافة النزاع بنجاح');
            setSuccess(true);
            onAdd();
            setTimeout(() => {
                setOpen(false);
                setSuccess(false);
            }, 1000);
        } catch (err) {
            toast.error('فشل في إنشاء النزاع');
            setError(err instanceof Error ? err.message : 'فشل في إنشاء النزاع');
        } finally {
            setIsSubmitting(false);
        }
    };

    const tabs = [
        // { title: "معلومات أساسية", icon: <Briefcase className="h-5 w-5" /> },
        { title: "معلومات الهيئة القضائية", disabled: !inCourt },
        { title: "معلومات القرار", icon: <ChevronLeft className="h-5 w-5" />, disabled: !hasJudgment }
    ];

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) onClose();
        }}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                    إضافة نزاع
                </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-4xl" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-primary">إضافة نزاع جديد</DialogTitle>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>خطأ</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {success && (
                    <Alert className="mb-4 border-green-500 bg-green-50 text-green-700">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <AlertTitle>تم بنجاح</AlertTitle>
                        <AlertDescription>تمت إضافة نزاع بنجاح!</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tabs */}
                    <div className="flex border-b">
                        {tabs.map((tab, index) => (
                            <button
                                key={index}
                                type="button"
                                disabled={tab.disabled}
                                className={cn(
                                    "flex items-center py-2 px-4 border-b-2 transition-colors",
                                    activeTab === index
                                        ? "border-primary text-primary font-medium"
                                        : "border-transparent hover:border-gray-300",
                                    tab.disabled && "opacity-50 cursor-not-allowed"
                                )}
                                onClick={() => !tab.disabled && setActiveTab(index)}
                            >
                                {tab.icon}
                                <span className="mr-2">{tab.title}</span>
                            </button>
                        ))}
                    </div>

                    {/* Stage 1: Basic Information */}
                    {/* {activeTab === 0 && (
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-base font-medium">تاريخ إرسال الملف للمحامي</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start">
                                                {formData.judgment_date ? format(formData.judgment_date, 'yyyy-MM-dd') : 'اختر تاريخ'}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={formData.judgment_date}
                                                onSelect={(date) => handleDateChange(date, 'judgment_date')}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                             

                                <Separator className="my-4" />

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                        <Checkbox
                                            id="inCourt"
                                            checked={inCourt}
                                            onCheckedChange={(checked) => {
                                                setInCourt(checked as boolean);
                                                if (checked) setActiveTab(1);
                                            }}
                                        />
                                        <Label htmlFor="inCourt" className="text-base font-medium cursor-pointer">
                                            هل النزاع في المحكمة؟
                                        </Label>
                                    </div>


                                </div>
                            </CardContent>
                        </Card>
                    )} */}

                    {/* Stage 2: Court Information */}
                    {activeTab === 0 && inCourt && (
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-base font-medium">الهيئة القضائية</Label>
                                    <AutoComplete
                                        options={courts}
                                        emptyMessage="لا توجد نتائج"
                                        placeholder="ابحث عن الهيئة القضائية"
                                        onValueChange={(value) => {
                                            setSelectedCourt(value);
                                            setFormData(prev => ({ ...prev, court: value?.label || '' }));
                                        }}
                                        value={selectedCourt}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-base font-medium">رقم القضية</Label>
                                        <Input
                                            name="court_case_number"
                                            value={formData.court_case_number}
                                            onChange={handleInputChange}
                                            placeholder="أدخل رقم القضية"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-base font-medium">رقم الفهرس</Label>
                                        <Input
                                            name="index_number"
                                            value={formData.index_number}
                                            onChange={handleInputChange}
                                            placeholder="أدخل رقم الفهرس"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-base font-medium">تاريخ الجلسة القادمة</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start">
                                                {formData.hearing_date
                                                    ? format(new Date(formData.hearing_date), 'yyyy-MM-dd')
                                                    : 'اختر تاريخ الجلسة'}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={formData.hearing_date ? new Date(formData.hearing_date) : undefined}
                                                onSelect={(date) =>
                                                    date &&
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        hearing_date: date,
                                                    }))
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-base font-medium">ملاحظات</Label>
                                    <Textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        placeholder="أدخل أي ملاحظات إضافية هنا..."
                                        className="min-h-[100px]"
                                    />
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <Checkbox
                                        id="hasJudgment"
                                        checked={hasJudgment}
                                        onCheckedChange={(checked) => {
                                            setHasJudgment(checked as boolean);
                                            if (checked) {
                                                setInCourt(true);
                                                setActiveTab(1);
                                            }
                                            if (!checked) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    judgment_summary: ''
                                                }));
                                            }
                                        }}
                                    />
                                    <Label htmlFor="hasJudgment" className="text-base font-medium cursor-pointer">
                                        هل تم اصدار القرار؟
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Stage 3: Judgment Information */}
                    {activeTab === 1 && hasJudgment && (
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-base font-medium">تاريخ اصدار القرار</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start">
                                                    {formData.judgment_date ? format(formData.judgment_date, 'yyyy-MM-dd') : 'اختر تاريخ'}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={formData.judgment_date}
                                                    onSelect={(date) => handleDateChange(date, 'judgment_date')}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-base font-medium">ملخص القرار</Label>
                                        <Input
                                            name="judgment_summary"
                                            value={formData.judgment_summary}
                                            onChange={handleInputChange}
                                            placeholder="أدخل ملخص القرار"
                                        />
                                    </div>
                                </div>
                               
                            </CardContent>
                        </Card>
                    )}

                    <DialogFooter className="flex flex-row-reverse justify-between mt-6">
                        <div>
                            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                                {isSubmitting ? 'جاري الإرسال...' : 'إضافة نزاع'}
                            </Button>
                        </div>
                        <div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="ml-2"
                            >
                                إلغاء
                            </Button>

                            {activeTab > 0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setActiveTab(prev => prev - 1)}
                                >
                                    السابق
                                </Button>
                            )}

                            {activeTab < tabs.filter(tab => !tab.disabled).length - 1 && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        const nextIndex = tabs.findIndex((tab, idx) => idx > activeTab && !tab.disabled);
                                        if (nextIndex !== -1) setActiveTab(nextIndex);
                                    }}
                                >
                                    التالي
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddJudicialCouncil;