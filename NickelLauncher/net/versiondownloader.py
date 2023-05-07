from typing import Any, Callable
import os
from xml.etree.ElementTree import Element, SubElement
from uuid import uuid4
import logging

from env import TEMP_DIR_PATH
from report import Report
from net.downloader import Downloader
from net import soap


class VersionDownloader:
    SECURED_URL = 'https://fe3.delivery.mp.microsoft.com/ClientWebService/client.asmx/secured'

    def __init__(self, reporthook: Callable[[Report], Any] | None = None):
        self._reporthook = reporthook

        self._downloader = Downloader(reporthook)

    def download(self, guid: str, path: str):
        logging.debug('Retrieving a download link...')
        if self._reporthook:
            self._reporthook(Report(Report.PROGRESS, 'Retrieving a download link'))
        link = self._get_link(guid)
        if not link:
            logging.error("Couldn't retrieve a download link")
            raise LinkRetrievalError("Couldn't retrieve a download link")

        logging.debug(f'Downloading a package to "{path}"...')
        temp_path = os.path.join(TEMP_DIR_PATH, str(uuid4()))
        self._downloader.download_file(link, temp_path)
        os.replace(temp_path, path)

    def _get_link(self, guid: str) -> str:
        envelope = self._build_link_request_envelope(self.SECURED_URL, guid)
        response_envelope = soap.post_envelope(self.SECURED_URL, envelope)
        return self._extract_link(response_envelope)

    @staticmethod
    def _extract_link(response_envelope: Element) -> str:
        file_locations = response_envelope.find(
            './{*}Body/{*}GetExtendedUpdateInfo2Response/{*}GetExtendedUpdateInfo2Result/{*}FileLocations'
        )
        if not file_locations:
            return ''
        for file_location in file_locations:
            url = file_location.findtext('./{*}Url')
            if url and url.startswith('http://tlu.dl.delivery.mp.microsoft.com/'):
                return url
        return ''

    @staticmethod
    def _build_link_request_envelope(url: str, guid: str) -> soap.Envelope:
        root = Element('GetExtendedUpdateInfo2')
        update_ids = SubElement(root, 'updateIDs')
        update_identity = SubElement(update_ids, 'UpdateIdentity')
        update_id = SubElement(update_identity, 'UpdateID')
        update_id.text = guid
        revision_number = SubElement(update_identity, 'RevisionNumber')
        revision_number.text = '1'
        info_types = SubElement(root, 'infoTypes')
        xml_update_fragment_type = SubElement(info_types, 'XmlUpdateFragmentType')
        xml_update_fragment_type.text = 'FileUrl'
        device_attributes = SubElement(root, 'deviceAttributes')
        device_attributes.text = 'E:BranchReadinessLevel=CBB&DchuNvidiaGrfxExists=1&ProcessorIdentifier=Intel64%20Family%206%20Model%2063%20Stepping%202&CurrentBranch=rs4_release&DataVer_RS5=1942&FlightRing=Retail&AttrDataVer=57&InstallLanguage=en-US&DchuAmdGrfxExists=1&OSUILocale=en-US&InstallationType=Client&FlightingBranchName=&Version_RS5=10&UpgEx_RS5=Green&GStatus_RS5=2&OSSkuId=48&App=WU&InstallDate=1529700913&ProcessorManufacturer=GenuineIntel&AppVer=10.0.17134.471&OSArchitecture=AMD64&UpdateManagementGroup=2&IsDeviceRetailDemo=0&HidOverGattReg=C%3A%5CWINDOWS%5CSystem32%5CDriverStore%5CFileRepository%5Chidbthle.inf_amd64_467f181075371c89%5CMicrosoft.Bluetooth.Profiles.HidOverGatt.dll&IsFlightingEnabled=0&DchuIntelGrfxExists=1&TelemetryLevel=1&DefaultUserRegion=244&DeferFeatureUpdatePeriodInDays=365&Bios=Unknown&WuClientVer=10.0.17134.471&PausedFeatureStatus=1&Steam=URL%3Asteam%20protocol&Free=8to16&OSVersion=10.0.17134.472&DeviceFamily=Windows.Desktop'

        return soap.Envelope(url, root)


class LinkRetrievalError(Exception):
    pass
