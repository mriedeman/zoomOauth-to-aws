import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from 'typeorm';

@Entity({
    name:'aws_transaction_log'
})
export class TransactionLogger {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({name: 'video_name', nullable: false})
    name: string;
    
    @CreateDateColumn({ name: 'date_stored', type: 'timestamp' })
    date: Date;

    //url received from aws response upon upload
    @Column({name: 'video_storage_url', nullable: true})
    videoStorageLocation: string;

    //Later this will be used to create a brief summary possibly using openAI or another language processing tool.
    @Column({name: 'transcript_storage_url', nullable: true})
    transcriptStorageLocation: string;

    //used later
    @Column({name: 'video_summary', nullable: true})
    summary: string;

    //If video is over 20MB but transcript is small then mark as true for manual edit later
    @Column({name: 'manual_edit', nullable: true, default: false})
    edit: boolean;

}